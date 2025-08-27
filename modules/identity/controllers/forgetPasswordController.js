const asyncHandler = require("express-async-handler");

const {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} = require("../services/forgetPasswordService");

exports.sendResetCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await sendResetCode(email);
  res.status(200).json({
    message: "✅ Reset code sent to your email",
  });
});

exports.verifyResetCode = asyncHandler(async (req, res) => {
  const { resetCode } = req.body;
  await verifyResetCode(resetCode);
  res.status(200).json({
    message: "✅ Reset code verified successfully",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  const token = await resetPassword(email, newPassword);
  res.status(200).json({
    message: "✅ Password has been reset successfully",
    token,
  });
});
