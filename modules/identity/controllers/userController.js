const asyncHandler = require("express-async-handler");

const {
  getMyDataService,
  updateMyDataService,
  deactivateMyUserService,
} = require("../services/userService");

exports.getMyData = asyncHandler(async (req, res) => {
  const user = await getMyDataService(req.user._id);
  res.status(200).json({
    status: "success",
    message: "📄 User data retrieved successfully",
    data: user,
  });
});

exports.updateMyData = asyncHandler(async (req, res) => {
  const updatedUser = await updateMyDataService(req.user._id, req.body);
  res.status(200).json({
    status: "success",
    message: "✏️ User data updated successfully",
    data: updatedUser,
  });
});

exports.deactivateMyUser = asyncHandler(async (req, res) => {
  await deactivateMyUserService(req.user._id);
  res.status(200).json({
    status: "success",
    message: "🛑 User account deactivated successfully",
  });
});
