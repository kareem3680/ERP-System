const { check } = require("express-validator");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.addProductToWishlistValidator = [
  check("productId").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleWare,
];

exports.removeProductFromWishlistValidator = [
  check("id").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleWare,
];
