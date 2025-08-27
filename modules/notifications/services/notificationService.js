const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("notification");
const notificationModel = require("../models/notificationModel");
const sanitize = require("../../../utils/sanitizeData");
const { getIo } = require("../../../config/socket");
const {
  createService,
  getAllService,
  getSpecificService,
} = require("../../../utils/servicesHandler");

exports.createNotificationService = asyncHandler(async (body) => {
  const notification = await createService(notificationModel, body);

  await logger.info("Notification created", { id: notification._id });

  return sanitize.sanitizeNotification(notification);
});

exports.createAndSendNotificationService = asyncHandler(async (body) => {
  const notification = await createService(notificationModel, body);

  const io = getIo();
  io.emit("newNotification", sanitize.sanitizeNotification(notification));

  await logger.info("Notification created and sent", { id: notification._id });

  return sanitize.sanitizeNotification(notification);
});

exports.getNotificationsService = asyncHandler(async (query) => {
  const result = await getAllService(notificationModel, query, "notification");

  await logger.info("Fetched notifications");

  return {
    ...result,
    data: result.data.map(sanitize.sanitizeNotification),
  };
});

exports.getSpecificNotificationService = asyncHandler(async (id) => {
  const notification = await getSpecificService(notificationModel, id);

  await logger.info("Fetched notification", { id });

  return sanitize.sanitizeNotification(notification);
});

exports.markAsReadService = asyncHandler(async (id) => {
  const notification = await notificationModel.findByIdAndUpdate(
    id,
    { status: "read" },
    { new: true }
  );
  if (!notification) {
    throw new ApiError("🛑 Notification not found", 404);
  }
  await logger.info("Marked notification as read", { id });
  return sanitize.sanitizeNotification(notification);
});

exports.markAllAsReadService = asyncHandler(async () => {
  await notificationModel.updateMany({ status: "unread" }, { status: "read" });
  await logger.info("Marked all notifications as read");
  return true;
});
