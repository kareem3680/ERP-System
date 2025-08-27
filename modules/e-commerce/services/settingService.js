const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("setting");
const settingModel = require("../models/settingModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");

exports.useSettingsService = asyncHandler(async (key) => {
  const setting = await settingModel.findOne({ key });
  if (!setting) {
    await logger.error("Setting not found", { key });
    throw new ApiError(`🛑 Setting not found for key: ${key}`, 404);
  }
  return setting.value;
});

exports.getSettingsService = asyncHandler(async () => {
  const settings = await settingModel.find();
  if (!settings.length) {
    await logger.error("No settings found");
    throw new ApiError("🛑 No settings found", 404);
  }
  await logger.info("Fetched all settings");
  return settings.map(sanitize.sanitizeSetting);
});

exports.createSettingService = asyncHandler(async (body) => {
  const exists = await settingModel.findOne({ key: body.key });
  if (exists) {
    await logger.error("Setting key already exists", { key: body.key });
    throw new ApiError("🛑 Setting key already exists", 400);
  }

  const setting = await settingModel.create(body);
  await logger.info("Setting created", { id: setting._id });
  return sanitize.sanitizeSetting(setting);
});

exports.updateSettingService = asyncHandler(async (id, value) => {
  const setting = await settingModel.findByIdAndUpdate(
    id,
    { value },
    { new: true, runValidators: true }
  );
  if (!setting) {
    await logger.error("Setting to update not found", { id });
    throw new ApiError(`🛑 No setting found for ID: ${id}`, 404);
  }

  await logger.info("Setting updated", { id });
  return sanitize.sanitizeSetting(setting);
});
