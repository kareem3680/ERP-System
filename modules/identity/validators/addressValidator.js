const { check } = require("express-validator");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.addAddressValidator = [
  check("alias")
    .notEmpty()
    .withMessage("Alias is required")
    .isLength({ min: 3, max: 10 })
    .withMessage("Alias must be between 3 and 10 characters"),

  check("details")
    .notEmpty()
    .withMessage("Details are required")
    .isLength({ min: 10, max: 40 })
    .withMessage("Details must be between 10 and 40 characters"),

  check("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone format"),

  check("country").notEmpty().withMessage("Country is required"),

  check("postalCode").notEmpty().withMessage("Postal code is required"),

  check("city").notEmpty().withMessage("City is required"),

  validatorMiddleWare,
];

exports.removeAddressValidator = [
  check("id")
    .notEmpty()
    .withMessage("Address ID is required")
    .isMongoId()
    .withMessage("Invalid address ID format"),

  validatorMiddleWare,
];
