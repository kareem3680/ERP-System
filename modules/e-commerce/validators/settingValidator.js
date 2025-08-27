const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createSettingValidator = [
  check("key")
    .notEmpty()
    .withMessage("Key is required")
    .isLength({ min: 2 })
    .withMessage("Key must be at least 2 characters"),

  check("value").notEmpty().withMessage("Value is required"),

  validatorMiddleware,
];

exports.updateSettingValidator = [
  check("id").isMongoId().withMessage("Invalid Setting ID format"),

  check("value").notEmpty().withMessage("Value is required"),

  validatorMiddleware,
];
