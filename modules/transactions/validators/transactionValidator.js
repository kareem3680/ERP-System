const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createSaleTransactionValidator = [
  check("orderNumber").notEmpty().withMessage("Order number is required"),

  check("warehouse")
    .notEmpty()
    .withMessage("Warehouse ID is required")
    .isMongoId()
    .withMessage("Invalid warehouse ID"),

  validatorMiddleware,
];

exports.createReturnTransactionValidator = [
  check("transactionNumber")
    .notEmpty()
    .withMessage("Transaction number is required"),

  check("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array"),

  check("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  check("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  validatorMiddleware,
];

exports.getTransactionValidator = [
  check("id").isMongoId().withMessage("Invalid transaction ID"),
  validatorMiddleware,
];
