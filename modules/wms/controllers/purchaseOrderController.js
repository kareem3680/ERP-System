const asyncHandler = require("express-async-handler");

const {
  createPurchaseOrderService,
  getPurchaseOrdersService,
  getPurchaseOrderByIdService,
  updatePurchaseOrderService,
  deletePurchaseOrderService,
} = require("../services/purchaseOrderService");

exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await createPurchaseOrderService(req.body);
  res.status(201).json({
    status: "success",
    message: "📝 Purchase order created successfully",
    data: purchaseOrder,
  });
});

exports.getPurchaseOrders = asyncHandler(async (req, res) => {
  const purchaseOrders = await getPurchaseOrdersService(req.query);
  res.status(200).json({
    status: "success",
    results: purchaseOrders.results,
    message: "📋 Purchase orders fetched successfully",
    data: purchaseOrders.data,
    pagination: purchaseOrders.paginationResult,
  });
});

exports.getPurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await getPurchaseOrderByIdService(req.params.id);
  res.status(200).json({
    status: "success",
    message: "📄 Purchase order fetched successfully",
    data: purchaseOrder,
  });
});

exports.updatePurchaseOrder = asyncHandler(async (req, res) => {
  const purchaseOrder = await updatePurchaseOrderService(
    req.params.id,
    req.body
  );
  res.status(200).json({
    status: "success",
    message: "✏️ Purchase order updated successfully",
    data: purchaseOrder,
  });
});

exports.deletePurchaseOrder = asyncHandler(async (req, res) => {
  const result = await deletePurchaseOrderService(req.params.id);
  res.status(200).json({
    status: "success",
    message: "🗑️ Purchase order deleted successfully",
  });
});
