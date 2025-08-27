const express = require("express");
const router = express.Router();

const brandController = require("../controllers/brandController");
const brandService = require("../services/brandService");
const brandValidator = require("../validators/brandValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(brandController.getBrands)
  .post(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    brandService.uploadBrandImageService,
    brandValidator.createBrandValidator,
    brandService.resizeAndUploadBrandImage,
    brandController.createBrand
  );

router
  .route("/:id")
  .get(brandValidator.getBrandValidator, brandController.getSpecificBrand)
  .put(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    brandService.uploadBrandImageService,
    brandValidator.updateBrandValidator,
    brandService.resizeAndUploadBrandImage,
    brandController.updateBrand
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    brandValidator.deleteBrandValidator,
    brandController.deleteBrand
  );

module.exports = router;
