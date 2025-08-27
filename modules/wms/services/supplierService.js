const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("supplier");
const supplierModel = require("../models/supplierModel");
const productModel = require("../../e-commerce/models/productModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createSupplierService = asyncHandler(async (body) => {
  const { products = [] } = body;

  if (products.length > 0) {
    const existingProducts = await productModel
      .find({ _id: { $in: products } })
      .select("_id");

    if (existingProducts.length !== products.length) {
      throw new ApiError("🛑 Some products do not exist", 400);
    }
  }

  const supplier = await createService(supplierModel, body);
  await logger.info("Created new supplier", { id: supplier._id });
  return sanitize.sanitizeSupplier(supplier);
});

exports.getSuppliersService = asyncHandler(async (query) => {
  const result = await getAllService(supplierModel, query, "supplier");
  await logger.info("Fetched all suppliers");
  return {
    ...result,
    data: result.data.map(sanitize.sanitizeSupplier),
  };
});

exports.getSupplierByIdService = asyncHandler(async (id) => {
  const supplier = await getSpecificService(supplierModel, id);
  await logger.info("Fetched supplier by ID", { id });
  return sanitize.sanitizeSupplier(supplier);
});

exports.updateSupplierService = asyncHandler(async (id, body) => {
  const { products = [] } = body;

  if (products.length > 0) {
    const existingProducts = await productModel
      .find({ _id: { $in: products } })
      .select("_id");

    if (existingProducts.length !== products.length) {
      throw new ApiError("🛑 Some products do not exist", 400);
    }
  }
  const updatedSupplier = await updateService(supplierModel, id, body);
  await logger.info("Updated supplier", { id: updatedSupplier._id });
  return sanitize.sanitizeSupplier(updatedSupplier);
});

exports.deleteSupplierService = asyncHandler(async (id) => {
  await deleteService(supplierModel, id);
  await logger.info("Deleted supplier", { id });
});
