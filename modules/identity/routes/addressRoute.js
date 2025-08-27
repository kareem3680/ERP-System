const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const authController = require("../controllers/authController");
const addressValidator = require("../validators/addressValidator");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("user"),
    addressController.getAllAddresses
  )
  .post(
    authController.protect,
    authController.allowedTo("user"),
    addressValidator.addAddressValidator,
    addressController.addAddress
  );

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.allowedTo("user"),
    addressValidator.removeAddressValidator,
    addressController.removeAddress
  );

module.exports = router;
