const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.updateMyDataValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Name must be at most 32 characters"),

  check("email").optional().isEmail().withMessage("Invalid email format"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number for Egypt or Saudi Arabia"),

  validatorMiddleware,
];
