const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const logger = new (require("../../../utils/loggerService"))("user");
const uploadImage = require("../../../middlewares/uploadImageMiddleware");
const uploadToS3 = require("../../../utils/s3Uploader");
const userModel = require("../models/userModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");

exports.uploadUserImageService = uploadImage.uploadSingleImage("profileImage");

exports.resizeImageService = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    const imageUrl = await uploadToS3(buffer, filename, "users");

    req.body.profileImage = imageUrl;
  }
  next();
});

exports.getMyDataService = asyncHandler(async (userId) => {
  const user = await userModel.findById(userId);
  if (!user) {
    await logger.error("User not found", { userId });
    throw new ApiError(`🛑 No user found with ID: ${userId}`, 404);
  }

  await logger.info("Fetched user data", { userId });
  return sanitize.sanitizeUser(user);
});

exports.updateMyDataService = asyncHandler(async (userId, updateData) => {
  const { name, email, phone, profileImage } = updateData;

  if (email) {
    const existingEmail = await userModel.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existingEmail) {
      await logger.error("Email already exists", { email });
      throw new ApiError("🛑 This email is already in use.", 400);
    }
  }

  const updateFields = { name, phone, profileImage };
  if (email) {
    updateFields.email = email;
    updateFields.isEmailVerified = false;
  }

  const user = await userModel.findByIdAndUpdate(userId, updateFields, {
    new: true,
  });

  if (!user) {
    await logger.error("User to update not found", { userId });
    throw new ApiError(`🛑 No user found with ID: ${userId}`, 404);
  }

  await logger.info("Updated user data", { userId });
  return sanitize.sanitizeUser(user);
});

exports.deactivateMyUserService = asyncHandler(async (userId) => {
  const user = await userModel.findByIdAndUpdate(userId, { active: false });

  if (!user) {
    await logger.error("User to deactivate not found", { userId });
    throw new ApiError(`🛑 No user found with ID: ${userId}`, 404);
  }

  await logger.info("User deactivated", { userId });
});
