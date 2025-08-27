const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("warehouse");
const warehouseModel = require("../models/warehouseModel");
const sanitize = require("../../../utils/sanitizeData");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createWarehouseService = asyncHandler(async (body) => {
  const warehouse = await createService(warehouseModel, body);
  await logger.info("Warehouse created", { id: warehouse._id });
  return sanitize.sanitizeWarehouse(warehouse);
});

exports.getWarehousesService = asyncHandler(async (query) => {
  const result = await getAllService(warehouseModel, query, "warehouse");
  await logger.info("Fetched warehouses");
  return {
    ...result,
    data: result.data.map(sanitize.sanitizeWarehouse),
  };
});

exports.getSpecificWarehouseService = asyncHandler(async (id) => {
  const warehouse = await getSpecificService(warehouseModel, id);
  await logger.info("Fetched warehouse", { id });
  return sanitize.sanitizeWarehouse(warehouse);
});

exports.updateWarehouseService = asyncHandler(async (id, body) => {
  const updated = await updateService(warehouseModel, id, body);
  await logger.info("Warehouse updated", { id });
  return sanitize.sanitizeWarehouse(updated);
});

exports.deleteWarehouseService = asyncHandler(async (id) => {
  const result = await deleteService(warehouseModel, id);
  await logger.info("Warehouse deleted", { id });
  return result;
});
