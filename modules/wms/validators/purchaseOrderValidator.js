const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createPurchaseOrderValidator = [
  check("supplier")
    .notEmpty()
    .withMessage("Supplier ID is required")
    .isMongoId()
    .withMessage("Invalid supplier ID"),

  check("warehouse")
    .notEmpty()
    .withMessage("Warehouse ID is required")
    .isMongoId()
    .withMessage("Invalid warehouse ID"),

  check("status")
    .optional()
    .isIn(["draft", "pending", "approved", "received", "closed", "cancelled"])
    .withMessage("Invalid status value"),

  check("items")
    .isArray({ min: 1 })
    .withMessage("Items must be an array with at least one product"),

  check("items.*.product")
    .notEmpty()
    .withMessage("Each item must reference a product")
    .isMongoId()
    .withMessage("Invalid product ID"),

  check("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  check("items.*.unitPrice")
    .notEmpty()
    .withMessage("Unit price is required")
    .isFloat({ min: 0 })
    .withMessage("Unit price cannot be negative"),

  check("taxes")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Taxes cannot be negative"),

  check("shipping")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("shipping cannot be negative"),

  validatorMiddleware,
];

exports.getPurchaseOrderValidator = [
  check("id").isMongoId().withMessage("Invalid purchase order ID"),
  validatorMiddleware,
];

exports.updatePurchaseOrderValidator = [
  check("id").isMongoId().withMessage("Invalid purchase order ID"),

  check("status")
    .optional()
    .isIn(["draft", "pending", "approved", "received", "closed", "cancelled"])
    .withMessage("Invalid status value"),

  validatorMiddleware,
];

exports.deletePurchaseOrderValidator = [
  check("id").isMongoId().withMessage("Invalid purchase order ID"),
  validatorMiddleware,
];
