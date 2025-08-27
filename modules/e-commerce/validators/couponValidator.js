const { check } = require("express-validator");
const moment = require("moment");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.getCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon ID format"),
  validatorMiddleware,
];

exports.createCouponValidator = [
  check("code")
    .notEmpty()
    .withMessage("Code is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Code must be 8 characters")
    .customSanitizer((value) => value.toUpperCase()),

  check("discount")
    .notEmpty()
    .withMessage("Discount is required")
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount must be between 1 and 100"),

  check("expire")
    .notEmpty()
    .withMessage("Expire date is required")
    .custom((value) => {
      if (!moment(value, "MM/DD/YYYY", true).isValid()) {
        throw new Error("Expire must be a valid date in MM/DD/YYYY format");
      }
      if (moment(value).isBefore(moment())) {
        throw new Error("Expire must be a future date");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.updateCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon ID format"),

  check("code")
    .optional()
    .isLength({ min: 8, max: 8 })
    .withMessage("Code must be 8 characters")
    .customSanitizer((value) => value.toUpperCase()),

  check("discount")
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage("Discount must be between 1 and 100"),

  check("expire")
    .optional()
    .custom((value) => {
      if (!moment(value, "MM/DD/YYYY", true).isValid()) {
        throw new Error("Expire must be a valid date in MM/DD/YYYY format");
      }
      if (moment(value).isBefore(moment())) {
        throw new Error("Expire must be a future date");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteCouponValidator = [
  check("id").isMongoId().withMessage("Invalid Coupon ID format"),
  validatorMiddleware,
];
