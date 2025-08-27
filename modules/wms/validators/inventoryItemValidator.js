const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createInventoryItemValidator = [
  check("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  check("warehouse")
    .notEmpty()
    .withMessage("Warehouse ID is required")
    .isMongoId()
    .withMessage("Invalid warehouse ID"),

  check("quantityOnHand")
    .notEmpty()
    .withMessage("Quantity on hand is required")
    .isInt({ min: 0 })
    .withMessage("Quantity on hand must be a non-negative integer"),

  check("reservedQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reserved quantity must be a non-negative integer"),

  check("damagedQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Damaged quantity must be a non-negative integer"),

  validatorMiddleware,
];

exports.getInventoryItemValidator = [
  check("id").isMongoId().withMessage("Invalid inventory item ID"),
  validatorMiddleware,
];

exports.updateInventoryItemValidator = [
  check("id").isMongoId().withMessage("Invalid inventory item ID"),

  check("quantityOnHand")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity on hand must be a non-negative integer"),

  check("reservedQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reserved quantity must be a non-negative integer"),

  check("damagedQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Damaged quantity must be a non-negative integer"),

  validatorMiddleware,
];

exports.deleteInventoryItemValidator = [
  check("id").isMongoId().withMessage("Invalid inventory item ID"),
  validatorMiddleware,
];
