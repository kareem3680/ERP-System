const express = require("express");
const router = express.Router();

const settingController = require("../controllers/settingController");
const settingValidator = require("../validators/settingValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    settingController.getSettings
  )
  .post(
    authController.protect,
    authController.allowedTo("admin"),
    settingValidator.createSettingValidator,
    settingController.createSetting
  );

router
  .route("/:id")
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    settingValidator.updateSettingValidator,
    settingController.updateSetting
  );

module.exports = router;
