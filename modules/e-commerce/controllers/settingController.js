const asyncHandler = require("express-async-handler");

const {
  createSettingService,
  updateSettingService,
  getSettingsService,
} = require("../services/settingService");

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsService();
  res.status(200).json({
    message: "⚙️ Settings fetched successfully",
    data: settings,
  });
});

exports.createSetting = asyncHandler(async (req, res) => {
  const setting = await createSettingService(req.body);
  res.status(201).json({
    message: "✅ Setting created successfully",
    data: setting,
  });
});

exports.updateSetting = asyncHandler(async (req, res) => {
  const updatedSetting = await updateSettingService(
    req.params.id,
    req.body.value
  );
  res.status(200).json({
    message: "🔄 Setting updated successfully",
    data: updatedSetting,
  });
});
