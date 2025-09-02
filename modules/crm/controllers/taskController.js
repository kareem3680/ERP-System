const asyncHandler = require("express-async-handler");

const {
  createTaskService,
  getTasksService,
  getSpecificTaskService,
  updateTaskService,
  deleteTaskService,
} = require("../services/taskService");

exports.createTask = asyncHandler(async (req, res) => {
  const task = await createTaskService(req.body, req.user._id);
  res.status(201).json({
    message: "✅ Task created successfully",
    data: task,
  });
});

exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await getTasksService(req.query);
  res.status(200).json({
    message: "✅ Tasks fetched successfully",
    ...tasks,
  });
});

exports.getSpecificTask = asyncHandler(async (req, res) => {
  const task = await getSpecificTaskService(req.params.id);
  res.status(200).json({
    message: "✅ Task fetched successfully",
    data: task,
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const updated = await updateTaskService(
    req.params.id,
    req.body,
    req.user._id
  );
  res.status(200).json({
    message: "✅ Task updated successfully",
    data: updated,
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const result = await deleteTaskService(req.params.id);
  res.status(200).json({
    message: "🗑️ Task deleted successfully",
    ...result,
  });
});
