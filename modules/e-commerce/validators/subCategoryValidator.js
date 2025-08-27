const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID"),
  validatorMiddleware,
];

exports.getAllSubCategoryValidator = [
  check("categoryId").optional().isMongoId().withMessage("Invalid Category ID"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("Name must be at most 32 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid Category ID"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID"),
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .custom((value, { req }) => {
      req.body.slug = slugify(value);
      return true;
    }),
  check("category").optional().isMongoId().withMessage("Invalid Category ID"),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory ID"),
  validatorMiddleware,
];
