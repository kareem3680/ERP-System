const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const logger = new (require("../../../utils/loggerService"))("update-password");
const userModel = require("../models/userModel");
const ApiError = require("../../../utils/apiError");
const createToken = require("../../../utils/createToken");
const sanitize = require("../../../utils/sanitizeData");

exports.updateMyPasswordService = asyncHandler(
  async (userId, currentPassword, newPassword) => {
    const user = await userModel.findById(userId);
    if (!user) {
      await logger.error("User not found", { userId });
      throw new ApiError(
        "🛑 Current or new password is invalid. Please check and try again.",
        400
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await logger.error("Incorrect current password", { userId });
      throw new ApiError(
        "🛑 Current or new password is invalid. Please check and try again.",
        400
      );
    }

    user.password = await bcrypt.hash(newPassword, 8);
    user.changedPasswordAt = Date.now();
    await user.save();

    const token = createToken(user._id);

    await logger.info("Password updated successfully", { userId: user._id });

    return {
      user: sanitize.sanitizeUser(user),
      token,
    };
  }
);
