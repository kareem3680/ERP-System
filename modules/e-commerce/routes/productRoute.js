const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const productService = require("../services/productService");
const productValidator = require("../validators/productValidator");
const authController = require("../../identity/controllers/authController");
const reviewRoute = require("./reviewRoute");

router.use("/:productId/reviews", reviewRoute);

router
  .route("/")
  .get(productController.getProducts)
  .post(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    productService.uploadProductImagesService,
    productValidator.createProductValidator,
    productController.createProduct
  );

router
  .route("/:id")
  .get(
    productValidator.getProductValidator,
    productController.getSpecificProduct
  )
  .put(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    productService.uploadProductImagesService,
    productValidator.updateProductValidator,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    productValidator.deleteProductValidator,
    productController.deleteProduct
  );

module.exports = router;
