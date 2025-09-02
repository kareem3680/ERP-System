const asyncHandler = require("express-async-handler");

const {
  createProjectService,
  getProjectsService,
  getSpecificProjectService,
  updateProjectService,
  deleteProjectService,
} = require("../services/projectService");

exports.createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService(req.body, req.user._id);
  res.status(201).json({
    message: "✅ Project created successfully",
    data: project,
  });
});

exports.getProjects = asyncHandler(async (req, res) => {
  const projects = await getProjectsService(req.query);
  res.status(200).json({
    message: "✅ Projects fetched successfully",
    ...projects,
  });
});

exports.getSpecificProject = asyncHandler(async (req, res) => {
  const project = await getSpecificProjectService(req.params.id);
  res.status(200).json({
    message: "✅ Project fetched successfully",
    data: project,
  });
});

exports.updateProject = asyncHandler(async (req, res) => {
  const updated = await updateProjectService(
    req.params.id,
    req.body,
    req.user._id
  );
  res.status(200).json({
    message: "✅ Project updated successfully",
    data: updated,
  });
});

exports.deleteProject = asyncHandler(async (req, res) => {
  const result = await deleteProjectService(req.params.id);
  res.status(200).json({
    message: "🗑️ Project deleted successfully",
    ...result,
  });
});
