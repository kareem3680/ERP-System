const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createInventoryMovementValidator = [
  check("purchaseOrder")
    .optional()
    .isMongoId()
    .withMessage("Invalid purchaseOrder ID"),

  check("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  check("type")
    .notEmpty()
    .withMessage("Movement type is required")
    .isIn(["in", "out", "transfer", "reclassify", "adjust"])
    .withMessage("Invalid movement type"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  check("warehouse").optional().isMongoId().withMessage("Invalid warehouse ID"),

  check("fromWarehouse")
    .optional()
    .isMongoId()
    .withMessage("Invalid fromWarehouse ID"),

  check("toWarehouse")
    .optional()
    .isMongoId()
    .withMessage("Invalid toWarehouse ID"),

  check("sourceStatus")
    .optional()
    .isIn(["quantityOnHand", "reservedQuantity", "damagedQuantity"])
    .withMessage("Invalid source status"),

  check("targetStatus")
    .optional()
    .isIn(["quantityOnHand", "reservedQuantity", "damagedQuantity"])
    .withMessage("Invalid target status"),

  check("note").optional().isString(),

  validatorMiddleware,
];

exports.getInventoryMovementValidator = [
  check("id").isMongoId().withMessage("Invalid movement ID"),
  validatorMiddleware,
];
