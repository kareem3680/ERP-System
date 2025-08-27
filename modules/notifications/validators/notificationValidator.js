const { check } = require("express-validator");
const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createNotificationValidator = [
  check("title").notEmpty().withMessage("Title is required"),
  check("message").notEmpty().withMessage("Message is required"),
  check("module")
    .optional()
    .isIn(["order", "wms", "inventory", "user", "general"])
    .withMessage("Invalid module type"),
  check("importance")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid importance"),
  validatorMiddleware,
];

exports.getNotificationValidator = [
  check("id").isMongoId().withMessage("Invalid notification ID"),
  validatorMiddleware,
];
