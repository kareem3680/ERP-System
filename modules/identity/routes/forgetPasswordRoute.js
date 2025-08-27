const express = require("express");
const router = express.Router();

const forgetPasswordController = require("../controllers/forgetPasswordController");
const forgetPasswordValidator = require("../validators/forgetPasswordValidator");

router.post(
  "/sendResetCode",
  forgetPasswordValidator.sendResetCodeValidator,
  forgetPasswordController.sendResetCode
);

router.post(
  "/verifyResetCode",
  forgetPasswordValidator.verifyResetCodeValidator,
  forgetPasswordController.verifyResetCode
);

router.put(
  "/resetPassword",
  forgetPasswordValidator.resetPasswordValidator,
  forgetPasswordController.resetPassword
);

module.exports = router;
