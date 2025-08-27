const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand Id Format"),
  validatorMiddleWare,
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name is required")
    .isLength({ min: 3 })
    .withMessage("Brand name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Brand name must be at most 32 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleWare,
];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand Id Format"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand Id Format"),
  validatorMiddleWare,
];
