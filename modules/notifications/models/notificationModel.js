const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    module: {
      type: String,
      enum: ["order", "wms", "system", "promotion", "inquiries", "general"],
      default: "general",
    },
    importance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    from: {
      type: String,
      default: "System",
    },
    toRole: {
      type: String,
    },
    toUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  { timestamps: true }
);

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;
