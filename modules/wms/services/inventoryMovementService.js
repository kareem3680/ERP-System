const asyncHandler = require("express-async-handler");

const InventoryMovement = require("../models/inventoryMovementModel");
const InventoryItem = require("../models/inventoryItemModel");
const PurchaseOrder = require("../models/purchaseOrderModel");
const productModel = require("../../../modules/e-commerce/models/productModel");
const WarehouseModel = require("../models/warehouseModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const logger = new (require("../../../utils/loggerService"))(
  "inventoryMovement"
);
const {
  createService,
  getAllService,
  getSpecificService,
} = require("../../../utils/servicesHandler");

const updateProductStock = async (productId) => {
  const items = await InventoryItem.find({ product: productId });
  const totalStock = items.reduce((acc, item) => acc + item.quantityOnHand, 0);
  await productModel.findByIdAndUpdate(productId, { quantity: totalStock });
};

const findInventoryItem = async (productId, warehouseId) => {
  const item = await InventoryItem.findOne({
    product: productId,
    warehouse: warehouseId,
  });
  if (!item)
    throw new ApiError(
      "🛑 Inventory item not found for this product and warehouse",
      404
    );
  return item;
};

const applyInventoryChange = async (
  product,
  warehouse,
  status,
  qty,
  action
) => {
  const item = await findInventoryItem(product, warehouse);
  const validStatuses = [
    "quantityOnHand",
    "reservedQuantity",
    "damagedQuantity",
  ];
  if (!validStatuses.includes(status))
    throw new ApiError("🛑 Invalid status field", 400);

  const current = item[status] || 0;
  const updated = action === "add" ? current + qty : current - qty;
  if (updated < 0) throw new ApiError("🛑 Quantity cannot be negative", 400);

  item[status] = updated;
  await item.save();
};

exports.createInventoryMovementService = asyncHandler(async (body, user) => {
  const {
    product,
    type,
    quantity,
    warehouse,
    fromWarehouse,
    toWarehouse,
    sourceStatus,
    targetStatus,
    purchaseOrder,
    note,
  } = body;

  // Validate product
  const existingProduct = await productModel.findById(product);
  if (!existingProduct) throw new ApiError("🛑 Product not found", 404);

  // Validate involved warehouses
  if (warehouse && !(await WarehouseModel.findById(warehouse)))
    throw new ApiError("🛑 Warehouse not found", 404);
  if (fromWarehouse && !(await WarehouseModel.findById(fromWarehouse)))
    throw new ApiError("🛑 Source warehouse not found", 404);
  if (toWarehouse && !(await WarehouseModel.findById(toWarehouse)))
    throw new ApiError("🛑 Destination warehouse not found", 404);

  // ==== Purchase Order checks ====
  if (["in", "out"].includes(type)) {
    if (!purchaseOrder) {
      throw new ApiError(
        "🛑 Purchase order is required for in/out movements",
        400
      );
    }

    const existingPO = await PurchaseOrder.findById(purchaseOrder);
    if (!existingPO) throw new ApiError("🛑 Purchase order not found", 404);

    if (type === "in" && ["received", "closed"].includes(existingPO.status)) {
      throw new ApiError("🛑 Purchase order is already completed", 400);
    }
    if (type === "out" && existingPO.status === "closed") {
      throw new ApiError("🛑 Purchase order is closed", 400);
    }

    const productInPO = existingPO.items.find(
      (p) => p.product.toString() === product.toString()
    );
    if (!productInPO) {
      throw new ApiError("🛑 Product not found in this purchase order", 400);
    }

    if (
      type === "in" &&
      warehouse.toString() !== existingPO.warehouse.toString()
    ) {
      throw new ApiError("🛑 Cannot receive into a different warehouse", 400);
    }

    const qtyMoved = await InventoryMovement.aggregate([
      {
        $match: {
          purchaseOrder: existingPO._id,
          product: existingProduct._id,
          type,
        },
      },
      {
        $group: { _id: null, totalQty: { $sum: "$quantity" } },
      },
    ]);
    const totalMoved = qtyMoved.length ? qtyMoved[0].totalQty : 0;

    if (totalMoved + quantity > productInPO.quantity) {
      throw new ApiError(
        `🛑 Cannot ${
          type === "in" ? "receive" : "move out"
        } more than ordered quantity`,
        400
      );
    }

    if (type === "in") {
      existingPO.status = "received";
      await existingPO.save();
    }
  }

  // ==== Apply movement logic ====
  switch (type) {
    case "in":
      await applyInventoryChange(
        product,
        warehouse,
        "quantityOnHand",
        quantity,
        "add"
      );
      break;
    case "out":
      await applyInventoryChange(
        product,
        warehouse,
        "quantityOnHand",
        quantity,
        "subtract"
      );
      break;
    case "transfer":
      await applyInventoryChange(
        product,
        fromWarehouse,
        "quantityOnHand",
        quantity,
        "subtract"
      );
      await applyInventoryChange(
        product,
        toWarehouse,
        "quantityOnHand",
        quantity,
        "add"
      );
      break;
    case "reclassify":
      await applyInventoryChange(
        product,
        warehouse,
        sourceStatus,
        quantity,
        "subtract"
      );
      await applyInventoryChange(
        product,
        warehouse,
        targetStatus,
        quantity,
        "add"
      );
      break;
    case "adjust":
      await applyInventoryChange(
        product,
        warehouse,
        sourceStatus,
        quantity,
        "add"
      );
      break;
    default:
      throw new ApiError("🛑 Invalid movement type", 400);
  }

  const movement = await createService(InventoryMovement, {
    product,
    type,
    quantity,
    warehouse,
    fromWarehouse,
    toWarehouse,
    sourceStatus,
    targetStatus,
    purchaseOrder,
    note,
    createdBy: user._id,
  });

  await updateProductStock(product);

  // clear related caches
  await delCache("inventoryMovements:all*");
  await delCache(`inventoryMovement:${movement._id}`);
  await delCache("products:all*");
  await delCache(`product:${product}`);

  await logger.info("Inventory movement created", { id: movement._id });
  return sanitize.sanitizeInventoryMovement(movement);
});

exports.getInventoryMovementsService = asyncHandler(async (query) => {
  return cacheWrapper(
    "inventoryMovements:all",
    async () => {
      const result = await getAllService(
        InventoryMovement,
        query,
        "inventoryMovement",
        {},
        {
          populate: [
            { path: "product", select: "title" },
            { path: "warehouse", select: "name" },
            { path: "fromWarehouse", select: "name" },
            { path: "toWarehouse", select: "name" },
            {
              path: "purchaseOrder",
              select: "orderNumber supplier status -_id",
              populate: {
                path: "supplier",
                model: "Supplier",
                select: "name -_id",
              },
            },
            { path: "createdBy", select: "name" },
          ],
        }
      );
      await logger.info("Fetched all inventory movements");
      return {
        ...result,
        data: result.data.map(sanitize.sanitizeInventoryMovement),
      };
    },
    60
  );
});

exports.getInventoryMovementByIdService = asyncHandler(async (id) => {
  return cacheWrapper(
    `inventoryMovement:${id}`,
    async () => {
      const movement = await getSpecificService(InventoryMovement, id, {
        populate: [
          { path: "product", select: "title" },
          { path: "warehouse", select: "name" },
          { path: "fromWarehouse", select: "name" },
          { path: "toWarehouse", select: "name" },
          {
            path: "purchaseOrder",
            select: "orderNumber supplier status -_id",
            populate: {
              path: "supplier",
              model: "Supplier",
              select: "name -_id",
            },
          },
          { path: "createdBy", select: "name" },
        ],
      });
      await logger.info("Fetched inventory movement", { id });
      return sanitize.sanitizeInventoryMovement(movement);
    },
    60
  );
});
