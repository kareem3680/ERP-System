const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const userService = require("../services/userService");
const userValidator = require("../validators/userValidator");
const authController = require("../controllers/authController");

router.get("/getMyData", authController.protect, userController.getMyData);

router.put(
  "/updateMyData",
  authController.protect,
  userService.uploadUserImageService,
  userValidator.updateMyDataValidator,
  userService.resizeImageService,
  userController.updateMyData
);

router.delete(
  "/deactivateMyUser",
  authController.protect,
  userController.deactivateMyUser
);

module.exports = router;
