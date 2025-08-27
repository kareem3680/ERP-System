const { check } = require("express-validator");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.addProductToCartValidator = [
  check("productId").isMongoId().withMessage("Invalid productId Format"),
  validatorMiddleWare,
];

exports.updateProductQuantityInCartValidator = [
  check("id").isMongoId().withMessage("Invalid cart item ID Format"),
  validatorMiddleWare,
];

exports.removeProductFromCartValidator = [
  check("id").isMongoId().withMessage("Invalid cart item ID Format"),
  validatorMiddleWare,
];

exports.applyCouponToCartValidator = [
  check("code")
    .optional()
    .isLength({ min: 8, max: 8 })
    .withMessage("Code must be 8 characters")
    .customSanitizer((value) => value.toUpperCase()),
  validatorMiddleWare,
];
