const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createTaskValidator = [
  check("title").notEmpty().withMessage("Task title is required"),
  check("description")
    .optional()
    .isString()
    .withMessage("Description must be string"),
  check("status")
    .optional()
    .isIn(["to-do", "in-progress", "complete"])
    .withMessage("Invalid status"),
  check("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  check("dueDate").optional().isISO8601().withMessage("Invalid due date"),
  check("project").notEmpty().isMongoId().withMessage("Project ID is required"),
  check("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid assigned user ID"),
  validatorMiddleware,
];

exports.getTaskValidator = [
  check("id").isMongoId().withMessage("Invalid task ID"),
  validatorMiddleware,
];

exports.updateTaskValidator = [
  check("id").isMongoId().withMessage("Invalid task ID"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().isString(),
  check("status").optional().isIn(["to-do", "in-progress", "complete"]),
  check("priority").optional().isIn(["low", "medium", "high"]),
  check("dueDate").optional().isISO8601(),
  check("project").optional().isMongoId(),
  check("assignedTo").optional().isMongoId(),
  validatorMiddleware,
];

exports.deleteTaskValidator = [
  check("id").isMongoId().withMessage("Invalid task ID"),
  validatorMiddleware,
];
