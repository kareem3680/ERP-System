const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("inventoryItem");
const InventoryItemModel = require("../models/inventoryItemModel");
const WarehouseModel = require("../models/warehouseModel");
const productModel = require("../../e-commerce/models/productModel");
const userModel = require("../../identity/models/userModel");
const sendEmails = require("../../../utils/sendEmail");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const { cacheWrapper, delCache } = require("../../../utils/cache");

const {
  createAndSendNotificationService,
} = require("../../notifications/services/notificationService");

const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

const updateProductStock = async (productId) => {
  const items = await InventoryItemModel.find({ product: productId });
  const totalStock = items.reduce((acc, item) => acc + item.quantityOnHand, 0);
  await productModel.findByIdAndUpdate(productId, { quantity: totalStock });
};

const validateRelations = async (productId, warehouseId) => {
  const product = await productModel.findById(productId);
  if (!product) {
    throw new ApiError("🛑 Product not found", 404);
  }

  const warehouse = await WarehouseModel.findById(warehouseId);
  if (!warehouse) {
    throw new ApiError("🛑 Warehouse not found", 404);
  }

  const existing = await InventoryItemModel.findOne({
    product: productId,
    warehouse: warehouseId,
  });

  if (existing) {
    throw new ApiError(
      "🛑 Inventory item already exists for this product and warehouse",
      400
    );
  }
};

exports.createInventoryItemService = asyncHandler(async (body) => {
  await validateRelations(body.product, body.warehouse);

  const item = await createService(InventoryItemModel, body);
  await updateProductStock(item.product);

  // clear related caches
  await delCache("inventoryItems:all*");
  await delCache("products:all*");
  await delCache(`product:${item.product}`);
  await delCache(`inventoryItem:${item._id}`);

  await logger.info("Inventory item created", { id: item._id });
  return sanitize.sanitizeInventoryItem(item);
});

exports.getInventoryItemsService = asyncHandler(async (query) => {
  return cacheWrapper(
    "inventoryItems:all",
    async () => {
      const result = await getAllService(
        InventoryItemModel,
        query,
        "inventoryItem",
        {},
        {
          populate: [
            { path: "product", select: "title imageCover" },
            { path: "warehouse", select: "name location" },
          ],
        }
      );
      await logger.info("Fetched all inventory items");
      return {
        ...result,
        data: result.data.map(sanitize.sanitizeInventoryItem),
      };
    },
    60
  );
});

exports.getSpecificInventoryItemService = asyncHandler(async (id) => {
  return cacheWrapper(
    `inventoryItem:${id}`,
    async () => {
      const document = await getSpecificService(InventoryItemModel, id, {
        populate: [
          { path: "product", select: "title imageCover" },
          { path: "warehouse", select: "name location" },
        ],
      });
      await logger.info("Fetched inventory item", { id });
      return sanitize.sanitizeInventoryItem(document);
    },
    60
  );
});

exports.updateInventoryItemService = asyncHandler(async (id, body) => {
  const { product, warehouse, ...rest } = body;
  const updated = await updateService(InventoryItemModel, id, rest);
  await updateProductStock(updated.product);

  // clear related caches
  await delCache("inventoryItems:all*");
  await delCache("products:all*");
  await delCache(`product:${updated.product}`);
  await delCache(`inventoryItem:${id}`);

  await logger.info("Inventory item updated", { id });
  return sanitize.sanitizeInventoryItem(updated);
});

exports.deleteInventoryItemService = asyncHandler(async (id) => {
  const result = await deleteService(InventoryItemModel, id);

  // clear related caches
  await delCache("inventoryItems:all*");
  await delCache("products:all*");
  await delCache(`inventoryItem:${id}`);

  await logger.info("Deleted inventory item", { id });
  return result;
});

exports.checkLowStockAndNotify = asyncHandler(async () => {
  const operations = await userModel
    .find({ role: "operation-manager" })
    .select("email");
  if (!operations.length) {
    await logger.warn("No operations found for low stock notification");
    return;
  }
  const operationEmails = operations.map((m) => m.email);

  const products = await productModel.find({});

  for (const product of products) {
    const totalQuantity = product.quantity;

    if (totalQuantity < 100) {
      await createAndSendNotificationService({
        title: `Low Stock: ${product.title}`,
        message: `Quantity is ${totalQuantity}. Please restock`,
        module: "wms",
        importance: "high",
        from: "System",
      });
      const subject = `🛑 Low Stock Alert for Product: ${product.title} - ${product._id}`;
      const message = `
The total stock quantity for product "${product.title}" is low.

Current quantity: ${totalQuantity}
Threshold: 100 units

Please restock as soon as possible.
      `.trim();

      for (const email of operationEmails) {
        await sendEmails({ email, subject, message });
      }

      await logger.info(`Low stock alert sent for product "${product.title}"`, {
        productId: product._id,
        quantity: totalQuantity,
        recipients: operationEmails,
      });
    }
  }
});
