const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const adminValidator = require("../validators/adminValidator");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    adminController.getUsers
  )
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    adminValidator.createUserValidator,
    adminController.createUser
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.allowedTo("admin"),
    adminValidator.getUserValidator,
    adminController.getSpecificUser
  )
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    adminValidator.updateUserValidator,
    adminController.updateUser
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    adminValidator.deleteUserValidator,
    adminController.deleteUser
  );

module.exports = router;
