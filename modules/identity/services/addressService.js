const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("user");
const userModel = require("../models/userModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");

exports.addAddressService = asyncHandler(async (userId, addressData) => {
  const user = await userModel.findByIdAndUpdate(
    userId,
    { $addToSet: { addresses: addressData } },
    { new: true }
  );

  if (!user) {
    await logger.error("Add address failed - user not found", { userId });
    throw new ApiError("🛑 User not found", 404);
  }

  await logger.info("Address added", { userId });
  return user.addresses.map(sanitize.sanitizeAddress);
});

exports.removeAddressService = asyncHandler(async (userId, addressId) => {
  const user = await userModel.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  );

  if (!user) {
    await logger.error("Remove address failed - user not found", { userId });
    throw new ApiError("🛑 User not found", 404);
  }

  const removed = !user.addresses.find(
    (addr) => addr._id.toString() === addressId
  );
  if (!removed) {
    await logger.warn("Address not removed - ID not found", { addressId });
    throw new ApiError("🛑 Address not found", 404);
  }

  await logger.info("Address removed", { userId, addressId });
  return user.addresses.map(sanitize.sanitizeAddress);
});

exports.getAllAddressesService = asyncHandler(async (userId) => {
  const user = await userModel.findById(userId);

  if (!user) {
    await logger.error("Get addresses failed - user not found", { userId });
    throw new ApiError("🛑 User not found", 404);
  }

  await logger.info("Fetched addresses", { userId });
  return user.addresses.map(sanitize.sanitizeAddress);
});
