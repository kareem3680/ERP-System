const asyncHandler = require("express-async-handler");

const taskModel = require("../models/taskModel");
const projectModel = require("../models/projectModel");
const logger = new (require("../../../utils/loggerService"))("dashboard");
const { cacheWrapper } = require("../../../utils/cache");

exports.getDashboardOverviewService = asyncHandler(async () => {
  return cacheWrapper(
    "dashboard:overview",
    async () => {
      const totalTasks = await taskModel.countDocuments();

      const tasksByStatus = await taskModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusCounts = tasksByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      const totalProjects = await projectModel.countDocuments();

      const tasksPerProject = await taskModel.aggregate([
        {
          $group: {
            _id: "$project",
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $ne: ["$status", "completed"] }, 1, 0],
              },
            },
          },
        },
      ]);

      const tasksPerUser = await taskModel.aggregate([
        {
          $group: {
            _id: "$assignedTo",
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            pending: {
              $sum: {
                $cond: [{ $ne: ["$status", "completed"] }, 1, 0],
              },
            },
          },
        },
      ]);

      await logger.info("Fetched dashboard overview");

      return {
        totalTasks,
        statusCounts,
        totalProjects,
        tasksPerProject,
        tasksPerUser,
      };
    },
    60
  );
});
