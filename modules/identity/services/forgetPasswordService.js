const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const logger = new (require("../../../utils/loggerService"))("forget-password");
const userModel = require("../models/userModel");
const createToken = require("../../../utils/createToken");
const sendEmails = require("../../../utils/sendEmail");
const ApiError = require("../../../utils/apiError");

exports.sendResetCode = asyncHandler(async (email) => {
  const user = await userModel.findOne({ email });
  if (!user) {
    await logger.error("User not found", { email });
    throw new ApiError(`🛑 No user found with this email: ${email}`, 404);
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = crypto.createHash("sha256").update(resetCode).digest("hex");

  user.passwordResetCode = hashed;
  user.passwordResetCodeExpiresAt = Date.now() + 10 * 60 * 1000;
  user.passwordResetCodeVerified = false;
  await user.save();

  try {
    await sendEmails({
      email: user.email,
      subject: "Reset your password",
      message: `Hello ${user.name}, your reset code is ${resetCode}. It expires in 10 minutes.`,
    });

    await logger.info("Reset code sent", { email });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpiresAt = undefined;
    user.passwordResetCodeVerified = undefined;
    await user.save();

    await logger.error("Failed to send reset email", { email });
    throw new ApiError("🛑 Failed to send reset email", 500);
  }
});

exports.verifyResetCode = asyncHandler(async (code) => {
  const hashed = crypto.createHash("sha256").update(code).digest("hex");

  const user = await userModel.findOne({
    passwordResetCode: hashed,
    passwordResetCodeExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    await logger.error("Invalid or expired code");
    throw new ApiError("🛑 Invalid or expired reset code", 401);
  }

  user.passwordResetCodeVerified = true;
  await user.save();

  await logger.info("Reset code verified", { email: user.email });
});

exports.resetPassword = asyncHandler(async (email, newPassword) => {
  const user = await userModel.findOne({ email });

  if (!user) {
    await logger.error("User not found during password reset", { email });
    throw new ApiError(`🛑 No user found with this email: ${email}`, 404);
  }

  if (!user.passwordResetCodeVerified) {
    await logger.error("Reset code not verified", { email });
    throw new ApiError("🛑 Reset code is not verified", 400);
  }

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpiresAt = undefined;
  user.passwordResetCodeVerified = undefined;
  await user.save();

  const token = createToken(user._id);
  await logger.info("Password reset successful", { email });

  return token;
});
