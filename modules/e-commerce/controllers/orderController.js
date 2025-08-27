const asyncHandler = require("express-async-handler");

const {
  createCashOrderService,
  createStripeSessionService,
  stripeWebhookCheckoutService,
  createPayMobSessionService,
  payMobWebhookCheckoutService,
  updateOrderStatusService,
  getAllOrdersService,
  deleteOrderService,
} = require("../services/orderService");

exports.createCashOrder = asyncHandler(async (req, res) => {
  const order = await createCashOrderService(req.user._id, req.params.id);
  res.status(201).json({
    message: "💵 Cash order placed successfully",
    data: order,
  });
});

exports.stripeCheckOutSession = asyncHandler(async (req, res) => {
  const session = await createStripeSessionService(
    req,
    req.user,
    req.params.id
  );
  res.status(200).json({
    message: "✅ Stripe session created",
    data: session.url,
  });
});

exports.stripeWebhookCheckout = asyncHandler(async (req, res) => {
  await stripeWebhookCheckoutService(req);
  res.status(200).send("✅ Webhook received");
});

exports.payMobCheckOutSession = asyncHandler(async (req, res) => {
  const iframeURL = await createPayMobSessionService(
    req,
    req.user,
    req.params.id
  );
  res.status(200).json({
    message: "✅ Paymob session created",
    data: { iframeURL },
  });
});

exports.payMobWebhookCheckout = asyncHandler(async (req, res) => {
  await payMobWebhookCheckoutService(req.body);
  res.status(200).send("✅ Webhook received");
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const updated = await updateOrderStatusService(req.params.id, req.body);
  res.status(200).json({
    message: "🔄 Order status updated",
    data: updated,
  });
});

exports.filterOrderForUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObject = { customer: req.user._id };
  next();
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const result = await getAllOrdersService(req.query, req.filterObject);
  res.status(200).json({
    message: "📦 Orders retrieved",
    data: result,
  });
});

exports.deleteOrder = asyncHandler(async (req, res) => {
  await deleteOrderService(req.params.id);
  res.status(202).json({ message: "🗑️ Order deleted successfully" });
});
