const express = require("express");
const router = express.Router();

const subCategoryRoute = require("./subCategoryRoute");
const categoryController = require("../controllers/categoryController");
const categoryService = require("../services/categoryService");
const authController = require("../../identity/controllers/authController");
const categoryValidator = require("../validators/categoryValidator");

router.use("/:categoryId/sub-categories", subCategoryRoute);

router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    categoryService.uploadCategoryImageService,
    categoryValidator.createCategoryValidator,
    categoryService.resizeAndUploadCategoryImage,
    categoryController.createCategory
  );

router
  .route("/:id")
  .get(
    categoryValidator.getCategoryValidator,
    categoryController.getSpecificCategory
  )
  .put(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    categoryService.uploadCategoryImageService,
    categoryValidator.updateCategoryValidator,
    categoryService.resizeAndUploadCategoryImage,
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    categoryValidator.deleteCategoryValidator,
    categoryController.deleteCategory
  );

module.exports = router;
