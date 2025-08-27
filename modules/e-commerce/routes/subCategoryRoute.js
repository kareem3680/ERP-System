const express = require("express");
const router = express.Router({ mergeParams: true });

const subCategoryController = require("../controllers/subCategoryController");
const subCategoryValidator = require("../validators/subCategoryValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(
    subCategoryController.createFilterObject,
    subCategoryValidator.getAllSubCategoryValidator,
    subCategoryController.getSubCategories
  )
  .post(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    subCategoryController.setCategoryRoute,
    subCategoryValidator.createSubCategoryValidator,
    subCategoryController.createSubCategory
  );

router
  .route("/:id")
  .get(
    subCategoryValidator.getSubCategoryValidator,
    subCategoryController.getSpecificSubCategory
  )
  .put(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    subCategoryValidator.updateSubCategoryValidator,
    subCategoryController.updateSubCategory
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    subCategoryValidator.deleteSubCategoryValidator,
    subCategoryController.deleteSubCategory
  );

module.exports = router;
