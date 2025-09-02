const asyncHandler = require("express-async-handler");

const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");
const userModel = require("../../identity/models/userModel");
const sanitize = require("../../../utils/sanitizeData");
const logger = new (require("../../../utils/loggerService"))("task");
const ApiError = require("../../../utils/apiError");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createAndSendNotificationService,
} = require("../../notifications/services/notificationService");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createTaskService = asyncHandler(async (body, userId) => {
  const { title, assignedTo, project } = body;

  const existingTask = await taskModel.findOne({ title });
  if (existingTask) {
    throw new ApiError("🛑 Task with this title already exists", 400);
  }

  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await userModel.findById(assignedTo);
    if (!assignedUser) {
      throw new ApiError("🛑 Assigned user not found", 404);
    }
  }

  if (project) {
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      throw new ApiError("🛑 Project not found", 404);
    }
  }

  const task = await createService(taskModel, {
    ...body,
    createdBy: userId,
  });

  await delCache("tasks:all*");
  await delCache(`task:${task._id}`);

  await logger.info("Task created", { id: task._id, createdBy: userId });

  if (assignedUser) {
    await createAndSendNotificationService({
      title: `New Task Assigned: ${task.title}`,
      message: `You have been assigned a new task "${task.title}"`,
      module: "system",
      importance: "high",
      from: userId,
      to: assignedUser._id,
    });
  }

  return sanitize.sanitizeTask(task);
});

exports.getTasksService = asyncHandler(async (query) => {
  return cacheWrapper(
    "tasks:all",
    async () => {
      const result = await getAllService(
        taskModel,
        query,
        "task",
        {},
        {
          populate: [
            { path: "assignedTo", select: "name email" },
            { path: "createdBy", select: "name email" },
          ],
        }
      );

      await logger.info("Fetched all tasks");

      return {
        ...result,
        data: result.data.map(sanitize.sanitizeTask),
      };
    },
    60
  );
});

exports.getSpecificTaskService = asyncHandler(async (id) => {
  return cacheWrapper(
    `task:${id}`,
    async () => {
      const task = await getSpecificService(taskModel, id, {
        populate: [
          { path: "assignedTo", select: "name email" },
          { path: "createdBy", select: "name email" },
        ],
      });

      if (!task) throw new ApiError("🛑 Task not found", 404);

      await logger.info("Fetched task", { id });
      return sanitize.sanitizeTask(task);
    },
    60
  );
});

exports.updateTaskService = asyncHandler(async (id, body, userId) => {
  const { title, assignedTo, project } = body;

  const task = await taskModel.findById(id);
  if (!task) {
    throw new ApiError("🛑 Task not found", 404);
  }

  if (title) {
    const existing = await taskModel.findOne({ title });
    if (existing && existing._id.toString() !== task._id.toString()) {
      throw new ApiError("🛑 Task with this title already exists", 400);
    }
  }

  let newAssignedUser = null;
  if (assignedTo) {
    newAssignedUser = await userModel.findById(assignedTo);
    if (!newAssignedUser) {
      throw new ApiError("🛑 Assigned user not found", 404);
    }

    if (
      task.assignedTo &&
      assignedTo.toString() === task.assignedTo.toString()
    ) {
      throw new ApiError("🛑 Already assigned to this user", 200);
    }
  }

  if (project) {
    const projectExists = await projectModel.findById(project);
    if (!projectExists) {
      throw new ApiError("🛑 Project not found", 404);
    }
  }

  const updatedTask = await updateService(taskModel, id, {
    ...body,
    updatedBy: userId,
  });

  await delCache("tasks:all*");
  await delCache(`task:${id}`);

  await logger.info("Task updated", { id, updatedBy: userId });

  if (newAssignedUser) {
    await createAndSendNotificationService({
      title: `Task Re-assigned: ${updatedTask.title}`,
      message: `You have been reassigned to task "${updatedTask.title}"`,
      module: "system",
      importance: "medium",
      from: userId,
      to: newAssignedUser._id,
    });
  }

  return sanitize.sanitizeTask(updatedTask);
});

exports.deleteTaskService = asyncHandler(async (id) => {
  const result = await deleteService(taskModel, id);

  await delCache("tasks:all*");
  await delCache(`task:${id}`);

  await logger.info("Task deleted", { id });
  return result;
});
