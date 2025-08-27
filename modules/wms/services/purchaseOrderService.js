const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("purchaseOrder");
const purchaseOrderModel = require("../models/purchaseOrderModel");
const supplierModel = require("../models/supplierModel");
const warehouseModel = require("../models/warehouseModel");
const productModel = require("../../e-commerce/models/productModel");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

const validateRelations = async (supplierId, warehouseId, items) => {
  const supplier = await supplierModel.findById(supplierId);
  if (!supplier) {
    throw new ApiError("🛑 Supplier not found", 404);
  }

  const warehouse = await warehouseModel.findById(warehouseId);
  if (!warehouse) {
    throw new ApiError("🛑 Warehouse not found", 404);
  }

  for (const item of items) {
    const product = await productModel.findById(item.product);
    if (!product) {
      throw new ApiError(`🛑 Product not found: ${item.product}`, 404);
    }
  }
};

exports.createPurchaseOrderService = asyncHandler(async (body) => {
  await validateRelations(body.supplier, body.warehouse, body.items);

  const order = await createService(purchaseOrderModel, body);

  // clear related caches
  await delCache("purchaseOrders:all*");
  await delCache(`purchaseOrder:${order._id}`);
  await delCache("products:all*");
  for (const item of body.items) {
    await delCache(`product:${item.product}`);
  }

  await logger.info("Purchase order created", { id: order._id });
  return sanitize.sanitizePurchaseOrder(order);
});

exports.getPurchaseOrdersService = asyncHandler(async (query) => {
  const cacheKey = `purchaseOrders:all:${JSON.stringify(query)}`;
  return cacheWrapper(cacheKey, async () => {
    const result = await getAllService(
      purchaseOrderModel,
      query,
      "purchaseOrder",
      {},
      {
        populate: [
          { path: "supplier", select: "name contactInfo" },
          { path: "items.product", select: "title imageCover" },
        ],
      }
    );
    await logger.info("Fetched all purchase orders");
    return {
      ...result,
      data: result.data.map(sanitize.sanitizePurchaseOrder),
    };
  });
});

exports.getPurchaseOrderByIdService = asyncHandler(async (id) => {
  const cacheKey = `purchaseOrder:${id}`;
  return cacheWrapper(cacheKey, async () => {
    const order = await getSpecificService(purchaseOrderModel, id, {
      populate: [
        { path: "supplier", select: "name contactInfo" },
        { path: "items.product", select: "title imageCover" },
      ],
    });
    await logger.info("Fetched purchase order", { id });
    return sanitize.sanitizePurchaseOrder(order);
  });
});

exports.updatePurchaseOrderService = asyncHandler(async (id, body) => {
  const { supplier, warehouse, items, ...rest } = body;

  if (supplier || items) {
    await validateRelations(
      supplier || body.supplier,
      warehouse || body.warehouse,
      items || body.items
    );
  }

  const updated = await updateService(purchaseOrderModel, id, rest);

  // clear related caches
  await delCache("purchaseOrders:all*");
  await delCache(`purchaseOrder:${id}`);
  await delCache("products:all*");
  if (items) {
    for (const item of items) {
      await delCache(`product:${item.product}`);
    }
  }

  await logger.info("Purchase order updated", { id });
  return sanitize.sanitizePurchaseOrder(updated);
});

exports.deletePurchaseOrderService = asyncHandler(async (id) => {
  const result = await deleteService(purchaseOrderModel, id);

  // clear related caches
  await delCache("purchaseOrders:all*");
  await delCache(`purchaseOrder:${id}`);
  await delCache("products:all*");

  await logger.info("Deleted purchase order", { id });
  return result;
});
