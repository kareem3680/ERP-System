const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authService = require("../services/authService");
const authValidator = require("../validators/authValidator");

router.post(
  "/signUp",
  authService.uploadUserImageService,
  authValidator.signUpValidator,
  authService.resizeImageService,
  authController.signUp
);

router.post("/signUp-google", authController.googleAuth);

router.post("/logIn", authValidator.logInValidator, authController.logIn);

router.post(
  "/verifyEmail",
  authValidator.verifyEmail,
  authController.verifyEmail
);

module.exports = router;
