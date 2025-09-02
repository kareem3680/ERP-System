const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createProjectValidator = [
  check("name")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({ min: 2 })
    .withMessage("Too short project name")
    .isLength({ max: 100 })
    .withMessage("Too long project name"),

  check("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Too long project description"),

  check("client")
    .notEmpty()
    .withMessage("Client ID is required")
    .isMongoId()
    .withMessage("Invalid Client ID format"),

  check("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date format"),

  check("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date format"),

  check("status")
    .optional()
    .isIn(["planned", "in-progress", "completed", "on-hold", "cancelled"])
    .withMessage("Invalid status value"),

  check("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number"),

  validatorMiddleware,
];

exports.updateProjectValidator = [
  check("id").isMongoId().withMessage("Invalid Project ID format"),

  check("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Too short project name")
    .isLength({ max: 100 })
    .withMessage("Too long project name"),

  check("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Too long project description"),

  check("client")
    .optional()
    .isMongoId()
    .withMessage("Invalid Client ID format"),

  check("startDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid start date format"),

  check("endDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Invalid end date format"),

  check("status")
    .optional()
    .isIn(["planned", "in-progress", "completed", "on-hold", "cancelled"])
    .withMessage("Invalid status value"),

  check("budget")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Budget must be a positive number"),

  validatorMiddleware,
];

exports.getProjectValidator = [
  check("id").isMongoId().withMessage("Invalid Project ID format"),
  validatorMiddleware,
];

exports.deleteProjectValidator = [
  check("id").isMongoId().withMessage("Invalid Project ID format"),
  validatorMiddleware,
];
