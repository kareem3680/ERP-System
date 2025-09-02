const asyncHandler = require("express-async-handler");

const projectModel = require("../models/projectModel");
const clientModel = require("../models/clientModel");
const sanitize = require("../../../utils/sanitizeData");
const logger = new (require("../../../utils/loggerService"))("project");
const ApiError = require("../../../utils/apiError");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createProjectService = asyncHandler(async (body, userId) => {
  const { name, client } = body;

  const existing = await projectModel.findOne({ name });
  if (existing) {
    throw new ApiError("🛑 Project with this name already exists", 400);
  }

  const clientExists = await clientModel.findById(client);
  if (!clientExists) {
    throw new ApiError("🛑 Client not found", 404);
  }

  const projectData = {
    ...body,
    createdBy: userId,
  };

  const project = await createService(projectModel, projectData);

  await delCache("projects:all*");
  await delCache(`project:${project._id}`);

  await logger.info("Project created", { id: project._id, createdBy: userId });

  return sanitize.sanitizeProject(project);
});

exports.getProjectsService = asyncHandler(async (query) => {
  return cacheWrapper(
    "projects:all",
    async () => {
      const result = await getAllService(
        projectModel,
        query,
        "project",
        {},
        {
          populate: [
            { path: "client", select: "name" },
            { path: "createdBy", select: "name" },
          ],
        }
      );

      await logger.info("Fetched all projects");

      return {
        ...result,
        data: result.data.map(sanitize.sanitizeProject),
      };
    },
    60
  );
});

exports.getSpecificProjectService = asyncHandler(async (id) => {
  return cacheWrapper(
    `project:${id}`,
    async () => {
      const project = await getSpecificService(projectModel, id, {
        populate: [
          { path: "client", select: "name" },
          { path: "createdBy", select: "name" },
        ],
      });

      if (!project) throw new ApiError("🛑 Project not found", 404);

      await logger.info("Fetched project", { id });
      return sanitize.sanitizeProject(project);
    },
    60
  );
});

exports.updateProjectService = asyncHandler(async (id, body, userId) => {
  const { name, client } = body;

  const project = await projectModel.findById(id);
  if (!project) {
    throw new ApiError("🛑 Project not found", 404);
  }

  if (name) {
    const existing = await projectModel.findOne({ name });
    if (existing && existing._id.toString() !== project._id.toString()) {
      throw new ApiError("🛑 Project with this name already exists", 400);
    }
  }

  if (client) {
    const clientExists = await clientModel.findById(client);
    if (!clientExists) {
      throw new ApiError("🛑 Client not found", 404);
    }
  }

  const updatedProject = await updateService(projectModel, id, {
    ...body,
    createdBy: userId,
  });

  await delCache("projects:all*");
  await delCache(`project:${id}`);

  await logger.info("Project updated", { id, updatedBy: userId });

  return sanitize.sanitizeProject(updatedProject);
});

exports.deleteProjectService = asyncHandler(async (id) => {
  const result = await deleteService(projectModel, id);

  await delCache("projects:all*");
  await delCache(`project:${id}`);

  await logger.info("Project deleted", { id });
  return result;
});
