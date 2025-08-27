const asyncHandler = require("express-async-handler");

const {
  createInventoryMovementService,
  getInventoryMovementsService,
  getInventoryMovementByIdService,
} = require("../services/inventoryMovementService");

exports.createInventoryMovement = asyncHandler(async (req, res) => {
  const movement = await createInventoryMovementService(req.body, req.user);
  res.status(201).json({
    message: "✅ Inventory movement created successfully",
    data: movement,
  });
});

exports.getInventoryMovements = asyncHandler(async (req, res) => {
  const result = await getInventoryMovementsService(req.query);
  res.status(200).json({
    message: "📦 Inventory movements retrieved",
    ...result,
  });
});

exports.getInventoryMovementById = asyncHandler(async (req, res) => {
  const movement = await getInventoryMovementByIdService(req.params.id);
  res.status(200).json({
    message: "🔍 Inventory movement details",
    data: movement,
  });
});
