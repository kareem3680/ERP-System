const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  check("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  check("sold")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sold must be a non-negative integer"),

  check("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ max: 250000 })
    .withMessage("Price must be a valid number and less than or equal 250000"),

  check("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  check("priceAfterDiscount")
    .optional()
    .isFloat({ max: 2000000 })
    .withMessage("Price after discount must be less than or equal 2000000"),

  check("imageCover").custom((val, { req }) => {
    if (!req.files?.imageCover) {
      throw new Error("Product imageCover is required");
    }
    return true;
  }),

  check("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),

  check("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  check("subCategories")
    .optional()
    .isArray()
    .withMessage("SubCategories must be an array")
    .custom((val) => {
      for (let sub of val) {
        if (!sub.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid subCategory ID format");
        }
      }
      return true;
    }),

  check("brand")
    .optional()
    .custom((val) => {
      if (val === "") return true;
      if (!val.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid brand ID format");
      }
      return true;
    }),

  check("ratingsAverage")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating average must be between 1 and 5"),

  check("ratingsQuantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Ratings quantity must be a non-negative integer"),

  validatorMiddleware,
];

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),
  validatorMiddleware,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),

  check("title")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  check("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  check("price")
    .optional()
    .isFloat({ max: 250000 })
    .withMessage("Price must be a valid number and less than or equal 250000"),

  check("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),

  check("priceAfterDiscount")
    .optional()
    .isFloat({ max: 2000000 })
    .withMessage("Price after discount must be less than or equal 2000000"),

  check("category").optional().isMongoId().withMessage("Invalid category ID"),

  check("subCategories")
    .optional()
    .isArray()
    .withMessage("SubCategories must be an array")
    .custom((val) => {
      for (let sub of val) {
        if (!sub.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("Invalid subCategory ID format");
        }
      }
      return true;
    }),

  check("brand")
    .optional()
    .custom((val) => {
      if (val === "") return true;
      if (!val.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error("Invalid brand ID format");
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid product ID"),
  validatorMiddleware,
];
