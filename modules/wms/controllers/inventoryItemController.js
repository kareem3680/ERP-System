const asyncHandler = require("express-async-handler");

const {
  createInventoryItemService,
  getInventoryItemsService,
  getSpecificInventoryItemService,
  updateInventoryItemService,
  deleteInventoryItemService,
} = require("../services/inventoryItemService");

exports.createInventoryItem = asyncHandler(async (req, res) => {
  const item = await createInventoryItemService(req.body);
  res.status(201).json({
    message: "✅ Inventory item created successfully",
    data: item,
  });
});

exports.getInventoryItems = asyncHandler(async (req, res) => {
  const items = await getInventoryItemsService(req.query);
  res.status(200).json({
    message: "✅ Inventory items fetched successfully",
    ...items,
  });
});

exports.getSpecificInventoryItem = asyncHandler(async (req, res) => {
  const item = await getSpecificInventoryItemService(req.params.id);
  res.status(200).json({
    message: "✅ Inventory item fetched successfully",
    data: item,
  });
});

exports.updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await updateInventoryItemService(req.params.id, req.body);
  res.status(200).json({
    message: "✅ Inventory item updated successfully",
    data: item,
  });
});

exports.deleteInventoryItem = asyncHandler(async (req, res) => {
  const result = await deleteInventoryItemService(req.params.id);
  res.status(200).json({
    message: "🗑️ Inventory item deleted successfully",
    ...result,
  });
});
