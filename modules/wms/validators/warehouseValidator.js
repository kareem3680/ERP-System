const { check } = require("express-validator");
const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createWarehouseValidator = [
  check("name").notEmpty().withMessage("Warehouse name is required"),
  check("location").notEmpty().withMessage("Warehouse location is required"),
  validatorMiddleware,
];

exports.getWarehouseValidator = [
  check("id").isMongoId().withMessage("Invalid warehouse ID"),
  validatorMiddleware,
];

exports.updateWarehouseValidator = [
  check("id").isMongoId().withMessage("Invalid warehouse ID"),
  check("name").optional(),
  check("location").optional(),
  validatorMiddleware,
];

exports.deleteWarehouseValidator = [
  check("id").isMongoId().withMessage("Invalid warehouse ID"),
  validatorMiddleware,
];
