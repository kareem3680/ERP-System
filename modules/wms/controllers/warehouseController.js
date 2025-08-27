const asyncHandler = require("express-async-handler");

const {
  createWarehouseService,
  getWarehousesService,
  getSpecificWarehouseService,
  updateWarehouseService,
  deleteWarehouseService,
} = require("../services/warehouseService");

exports.createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await createWarehouseService(req.body);
  res.status(201).json({
    message: "✅ Warehouse created successfully",
    data: warehouse,
  });
});

exports.getWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await getWarehousesService(req.query);
  res.status(200).json({
    message: "✅ Warehouses fetched successfully",
    ...warehouses,
  });
});

exports.getSpecificWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await getSpecificWarehouseService(req.params.id);
  res.status(200).json({
    message: "✅ Warehouse fetched successfully",
    data: warehouse,
  });
});

exports.updateWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await updateWarehouseService(req.params.id, req.body);
  res.status(200).json({
    message: "✅ Warehouse updated successfully",
    data: warehouse,
  });
});

exports.deleteWarehouse = asyncHandler(async (req, res) => {
  const result = await deleteWarehouseService(req.params.id);
  res.status(200).json({
    message: "🗑️ Warehouse deleted successfully",
    ...result,
  });
});
