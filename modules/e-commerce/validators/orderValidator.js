const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createCashOrderValidator = [
  check("id").isMongoId().withMessage("Invalid Cart ID Format"),
  validatorMiddleware,
];

exports.updateOrderStatusValidator = [
  check("id").isMongoId().withMessage("Invalid Order ID Format"),

  check("status")
    .optional()
    .isIn(["pending", "processing", "shipped", "delivered", "canceled"])
    .withMessage(
      "Status must be one of: pending, processing, shipped, delivered, canceled"
    ),

  check("isPaid")
    .optional()
    .isBoolean()
    .withMessage("isPaid must be a boolean value"),

  validatorMiddleware,
];

exports.deleteOrderValidator = [
  check("id").isMongoId().withMessage("Invalid Order ID Format"),
  validatorMiddleware,
];
