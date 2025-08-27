const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const logger = new (require("../../../utils/loggerService"))("transaction");
const transactionModel = require("../models/transactionModel");
const inventoryItemModel = require("../../wms/models/inventoryItemModel");
const orderModel = require("../../e-commerce/models/orderModel");
const productModel = require("../../e-commerce/models/productModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  getAllService,
  getSpecificService,
} = require("../../../utils/servicesHandler");

const updateProductStock = async (productId) => {
  const items = await inventoryItemModel.find({ product: productId });
  const totalStock = items.reduce((acc, item) => acc + item.quantityOnHand, 0);
  await productModel.findByIdAndUpdate(productId, { quantity: totalStock });
};

const updateProductSold = async (productId, quantity, type) => {
  if (!["sale", "return"].includes(type)) return;

  const incValue = type === "sale" ? quantity : -quantity;

  await productModel.findByIdAndUpdate(productId, {
    $inc: { sold: incValue },
  });
};

exports.createSaleTransactionService = asyncHandler(async (body, userId) => {
  const { orderNumber, warehouse } = body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderDoc = await orderModel.findOne({ orderNumber }).session(session);
    if (!orderDoc) {
      throw new ApiError("🛑 Order not found", 404);
    }

    const items = orderDoc.items; // from Order

    // Loop & Deduct
    for (const item of items) {
      const inventoryItem = await inventoryItemModel
        .findOne({
          product: item.product,
          warehouse: warehouse,
        })
        .session(session);

      if (!inventoryItem)
        throw new ApiError("🛑 Inventory item not found", 404);

      if (inventoryItem.quantityOnHand < item.quantity) {
        throw new ApiError("🛑 Insufficient stock quantity", 400);
      }

      inventoryItem.quantityOnHand =
        Number(inventoryItem.quantityOnHand) - Number(item.quantity);

      await inventoryItem.save({ session });
    }

    // Create transaction
    const totalAmount =
      orderDoc.totalOrderPrice ||
      items.reduce((acc, it) => acc + it.quantity * it.price, 0);

    const created = await transactionModel.create(
      [
        {
          order: orderDoc._id,
          warehouse,
          type: "sale",
          items,
          totalAmount,
          createdBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // After commit: update Product.total stock
    for (const item of items) {
      await updateProductStock(item.product);
      await updateProductSold(item.product, item.quantity, "sale");
      await delCache(`product:${item.product.id}`);
    }

    // clear related caches
    await delCache("transactions:all*");
    await delCache(`transaction:${created[0]._id}`);
    await delCache("products:all*");

    await logger.info("Sale transaction created", { id: created[0]._id });
    return sanitize.sanitizeTransaction(created[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

exports.createReturnTransactionService = asyncHandler(async (body, userId) => {
  const { transactionNumber, items } = body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const saleTransaction = await transactionModel
      .findOne({ transactionNumber })
      .session(session);

    if (!saleTransaction)
      throw new ApiError("🛑 Original sale transaction not found", 404);

    if (saleTransaction.isReturned)
      throw new ApiError(
        "🛑 This sale transaction has already been returned",
        400
      );

    // validate quantity
    for (const retItem of items) {
      const originalItem = saleTransaction.items.find((it) => {
        const prodId =
          it.product && it.product._id
            ? it.product._id.toString()
            : it.product.toString();
        return prodId === retItem.product;
      });

      if (!originalItem || retItem.quantity > originalItem.quantity) {
        throw new ApiError("🛑 Invalid return items or quantities", 400);
      }
    }

    // build returnItems with original price
    const returnItems = items.map((retItem) => {
      const originalItem = saleTransaction.items.find((it) => {
        const prodId =
          it.product && it.product._id
            ? it.product._id.toString()
            : it.product.toString();
        return prodId === retItem.product;
      });
      return {
        product: retItem.product,
        quantity: Number(retItem.quantity),
        price: originalItem.price,
      };
    });

    // increase stock
    for (const item of returnItems) {
      const inventoryItem = await inventoryItemModel
        .findOne({
          product: item.product,
          warehouse: saleTransaction.warehouse,
        })
        .session(session);

      if (!inventoryItem)
        throw new ApiError(
          "🛑 Inventory item not found for this product and warehouse",
          404
        );

      inventoryItem.quantityOnHand =
        Number(inventoryItem.quantityOnHand) + Number(item.quantity);

      await inventoryItem.save({ session });
    }

    const totalAmount = returnItems.reduce(
      (acc, it) => acc + it.quantity * it.price,
      0
    );

    const createdReturn = await transactionModel.create(
      [
        {
          warehouse: saleTransaction.warehouse,
          type: "return",
          items: returnItems,
          totalAmount,
          returnOf: saleTransaction._id,
          createdBy: userId,
        },
      ],
      { session }
    );

    saleTransaction.isReturned = true;
    await saleTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    for (const item of returnItems) {
      await updateProductStock(item.product);
      await updateProductSold(item.product, item.quantity, "return");
      await delCache(`product:${item.product}`);
    }

    // clear related caches
    await delCache("transactions:all*");
    await delCache(`transaction:${createdReturn[0]._id}`);
    await delCache("products:all*");

    await logger.info("Return transaction created", {
      id: createdReturn[0]._id,
    });
    return sanitize.sanitizeTransaction(createdReturn[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

exports.getTransactionsService = asyncHandler(async (query) => {
  return cacheWrapper(
    "transactions:all",
    async () => {
      const result = await getAllService(
        transactionModel,
        query,
        "transaction",
        {},
        {
          populate: [
            { path: "order", select: "orderNumber totalOrderPrice" },
            { path: "warehouse", select: "name location" },
            { path: "items.product", select: "title imageCover" },
            { path: "createdBy", select: "name email" },
          ],
        }
      );
      await logger.info("Fetched all transactions");
      return {
        ...result,
        data: result.data.map(sanitize.sanitizeTransaction),
      };
    },
    60
  );
});

exports.getSpecificTransactionService = asyncHandler(async (id) => {
  return cacheWrapper(
    `transaction:${id}`,
    async () => {
      const document = await getSpecificService(transactionModel, id, {
        populate: [
          { path: "order", select: "orderNumber totalOrderPrice" },
          { path: "warehouse", select: "name location" },
          { path: "items.product", select: "title imageCover" },
          { path: "createdBy", select: "name email" },
        ],
      });

      await logger.info("Fetched transaction", { id });
      return sanitize.sanitizeTransaction(document);
    },
    60
  );
});
