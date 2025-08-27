const { check } = require("express-validator");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.createReviewValidator = [
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  check("product").isMongoId().withMessage("Invalid product ID format"),
  validatorMiddleWare,
];

exports.updateReviewValidator = [
  check("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  check("id").isMongoId().withMessage("Invalid review ID format"),
  validatorMiddleWare,
];

exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review ID format"),
  validatorMiddleWare,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review ID format"),
  validatorMiddleWare,
];
