const express = require("express");
const router = express.Router();

const authController = require("../../identity/controllers/authController");
const notificationController = require("../controllers/notificationController");
const notificationValidator = require("../validators/notificationValidator");

router.use(
  authController.protect,
  authController.allowedTo("admin", "operation-manager")
);

router
  .route("/")
  .get(notificationController.getNotifications)
  .post(
    notificationValidator.createNotificationValidator,
    notificationController.createNotification
  );

router.post(
  "/send",
  notificationValidator.createNotificationValidator,
  notificationController.createAndSendNotification
);

router
  .route("/:id")
  .get(
    notificationValidator.getNotificationValidator,
    notificationController.getSpecificNotification
  );

router.put(
  "/mark/:id",
  notificationValidator.getNotificationValidator,
  notificationController.markAsRead
);

router.put("/mark-all", notificationController.markAllAsRead);

module.exports = router;
