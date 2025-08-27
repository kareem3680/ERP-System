const asyncHandler = require("express-async-handler");

const {
  addAddressService,
  removeAddressService,
  getAllAddressesService,
} = require("../services/addressService");

exports.addAddress = asyncHandler(async (req, res) => {
  const addresses = await addAddressService(req.user._id, req.body);
  res.status(200).json({
    message: "📍 Address added successfully",
    data: addresses,
  });
});

exports.removeAddress = asyncHandler(async (req, res) => {
  const addresses = await removeAddressService(req.user._id, req.params.id);
  res.status(200).json({
    message: "🗑️ Address removed successfully",
  });
});

exports.getAllAddresses = asyncHandler(async (req, res) => {
  const addresses = await getAllAddressesService(req.user._id);
  res.status(200).json({
    results: addresses.length,
    message: "📦 All addresses retrieved",
    data: addresses,
  });
});
