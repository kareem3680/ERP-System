const asyncHandler = require("express-async-handler");

const {
  createNotificationService,
  createAndSendNotificationService,
  getNotificationsService,
  getSpecificNotificationService,
  markAsReadService,
  markAllAsReadService,
} = require("../services/notificationService");

exports.createNotification = asyncHandler(async (req, res) => {
  const notification = await createNotificationService(req.body);
  res.status(201).json({
    message: "✅ Notification created successfully",
    data: notification,
  });
});

exports.createAndSendNotification = asyncHandler(async (req, res) => {
  const notification = await createAndSendNotificationService(req.body);
  res.status(201).json({
    message: "✅ Notification sent successfully",
    data: notification,
  });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const result = await getNotificationsService(req.query);
  res.status(200).json({
    message: "✅ Notifications fetched successfully",
    ...result,
  });
});

exports.getSpecificNotification = asyncHandler(async (req, res) => {
  const notification = await getSpecificNotificationService(req.params.id);
  res.status(200).json({
    message: "✅ Notification fetched successfully",
    data: notification,
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await markAsReadService(req.params.id);
  res.status(200).json({
    message: "✅ Notification marked as read",
    data: notification,
  });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await markAllAsReadService();
  res.status(200).json({
    message: "✅ All notifications marked as read",
  });
});
