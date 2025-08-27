const { body, param } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createSupplierValidator = [
  body("name")
    .notEmpty()
    .withMessage("Supplier name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  validatorMiddleware,
];

exports.updateSupplierValidator = [
  param("id").isMongoId().withMessage("Invalid supplier ID format"),
  body("name")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Invalid Egyptian phone number"),
  validatorMiddleware,
];

exports.getSupplierValidator = [
  param("id").isMongoId().withMessage("Invalid supplier ID format"),
  validatorMiddleware,
];

exports.deleteSupplierValidator = [
  param("id").isMongoId().withMessage("Invalid supplier ID format"),
  validatorMiddleware,
];
