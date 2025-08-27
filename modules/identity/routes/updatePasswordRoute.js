const express = require("express");
const router = express.Router();

const updatePasswordController = require("../controllers/updatePasswordController");
const updatePasswordValidator = require("../validators/updatePasswordValidator");
const authController = require("../controllers/authController");

router.put(
  "/",
  authController.protect,
  updatePasswordValidator.updatePasswordValidator,
  updatePasswordController.updateMyPassword
);

module.exports = router;
