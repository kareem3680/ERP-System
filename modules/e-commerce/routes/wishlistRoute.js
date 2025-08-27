const express = require("express");
const router = express.Router();

const wishlistController = require("../controllers/wishlistController");
const wishlistValidator = require("../validators/wishlistValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("user"),
    wishlistController.getAllWishlists
  )
  .post(
    authController.protect,
    authController.allowedTo("user"),
    wishlistValidator.addProductToWishlistValidator,
    wishlistController.addProductToWishlist
  );

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.allowedTo("user"),
    wishlistValidator.removeProductFromWishlistValidator,
    wishlistController.removeProductFromWishlist
  );

module.exports = router;
