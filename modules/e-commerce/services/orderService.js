const asyncHandler = require("express-async-handler");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const logger = new (require("../../../utils/loggerService"))("order");
const sendEmails = require("../../../utils/sendEmail");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const userModel = require("../../identity/models/userModel");
const settingService = require("./settingService");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createAndSendNotificationService,
} = require("../../notifications/services/notificationService");
const {
  getAllService,
  deleteService,
} = require("../../../utils/servicesHandler");

const calculateTotalPrice = async (cart) => {
  const taxes = await settingService.useSettingsService("taxes");
  const shipping = await settingService.useSettingsService("shipping");
  const basePrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  return {
    base: basePrice,
    taxes: (basePrice * taxes) / 100,
    shipping,
    total: basePrice + (basePrice * taxes) / 100 + shipping,
  };
};

const notifyModeratorsAboutOrder = async (order, user) => {
  const moderators = await userModel
    .find({ role: "moderator" })
    .select("email name");

  const subject = `📦 New Order Created (${order.paymentMethod || "Unknown"})`;
  const textMessage = `
New order has been created.

Order ID: ${order._id}
Customer: ${user.email}
Total Price: ${order.totalOrderPrice} AED
Payment Method: ${order.paymentMethod || "Not specified"}
Status: ${order.status}

Please review the order in the admin panel.
  `.trim();

  for (const mod of moderators) {
    await sendEmails({
      email: mod.email,
      subject,
      message: textMessage,
    });
  }
};

const createStripeCreditOrderService = async (session) => {
  try {
    const cartId = session.client_reference_id;
    const cart = await cartModel.findById(cartId);
    if (!cart)
      throw new ApiError("🛑 Cart not found for this Stripe session", 404);

    const user = await userModel.findOne({ email: session.customer_email });
    if (!user) throw new ApiError("🛑 User not found for this email", 404);

    const { base, taxes, shipping } = await calculateTotalPrice(cart);

    const order = await orderModel.create({
      customer: user._id,
      shippingAddress: session.customer_details.address,
      items: cart.cartItems,
      cartPrice: base,
      taxes,
      shipping,
      totalOrderPrice: session.amount_total / 100,
      status: "pending",
      paymentMethod: "onlinePayment-Stripe",
      isPaid: true,
      paidAt: Date.now(),
    });

    if (!order) throw new ApiError("🛑 Failed to create order", 500);

    await cartModel.findByIdAndDelete(cartId);

    await logger.info("Stripe order completed", {
      orderId: order._id,
      customer: user.email,
      total: order.totalOrderPrice,
    });
    return { order, user };
  } catch (error) {
    const msg =
      error instanceof ApiError
        ? error.message
        : "🛑 Failed to process Stripe order";
    const code = error instanceof ApiError ? error.statusCode : 500;

    await logger.error(msg, error.message);
    throw new ApiError("🛑 Error creating Stripe credit order", code);
  }
};

const createPayMobCreditOrderService = async (paymentData) => {
  try {
    const paymobOrderId = paymentData.order.id;
    const email = paymentData.order.shipping_data.email;
    const address = paymentData.order.shipping_data;

    const cart = await cartModel.findOne({ paymobOrderId });
    if (!cart)
      throw new ApiError("🛑 Cart not found for this Paymob order", 404);

    const user = await userModel.findOne({ email });
    if (!user) throw new ApiError("🛑 User not found for this email", 404);

    const calculate = await calculateTotalPrice(cart);
    const shipping = calculate.shipping;
    const cartPrice = calculate.base;
    const taxes = calculate.taxes;
    const totalOrderPrice = Number(calculate.total);

    const shippingAddress = {
      details: address.street || "N/A",
      phone: address.phone_number || "N/A",
      city: address.city || "N/A",
      country: address.country || "N/A",
      postalCode: address.postal_code || "N/A",
    };

    const order = await orderModel.create({
      customer: user._id,
      shippingAddress,
      items: cart.cartItems,
      cartPrice,
      taxes,
      shipping,
      totalOrderPrice,
      status: "pending",
      paymentMethod: "onlinePayment-Paymob",
      isPaid: true,
      paidAt: Date.now(),
    });

    if (!order) throw new ApiError("🛑 Failed to create order", 500);

    await cartModel.findByIdAndDelete(cart._id);

    await logger.info("Paymob order completed", {
      orderId: order._id,
      customer: user.email,
      total: order.totalOrderPrice,
    });

    return { order, user };
  } catch (error) {
    const msg =
      error instanceof ApiError
        ? error.message
        : "🛑 Failed to process Paymob order";
    const code = error instanceof ApiError ? error.statusCode : 500;

    await logger.error(msg, error.message);
    throw new ApiError("🛑 Error creating Paymob credit order", code);
  }
};

exports.createCashOrderService = asyncHandler(async (userId, cartId) => {
  const cart = await cartModel.findById(cartId);
  const user = await userModel.findById(userId);
  if (!cart) throw new ApiError("🛒 No cart found for this user", 404);

  const { base, taxes, shipping, total } = await calculateTotalPrice(cart);

  const order = await orderModel.create({
    customer: userId,
    items: cart.cartItems,
    cartPrice: base,
    taxes,
    shipping,
    totalOrderPrice: total,
    status: "pending",
  });

  await cartModel.findByIdAndDelete(cartId);

  await delCache("orders:all*");
  await delCache(`order:${order._id}`);

  await delCache(`cart:${userId}`);
  await delCache(`cart:all*`);

  await logger.info("Cash order created", { orderId: order._id });
  await createAndSendNotificationService({
    title: `New Order #${order.orderNumber}`,
    message: `User ${user.name} placed a new order`,
    module: "order",
    importance: "high",
    from: user.name,
  });
  await notifyModeratorsAboutOrder(order, user);
  return sanitize.sanitizeOrder(order);
});

exports.createStripeSessionService = asyncHandler(async (req, user, cartId) => {
  const cart = await cartModel.findById(cartId);
  if (!cart) throw new ApiError("🛒 No cart found for this user", 404);

  const { total } = await calculateTotalPrice(cart);
  const address = user.addresses?.[0] || {};

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "aed",
          product_data: { name: user.name },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/carts`,
    customer_email: user.email,
    client_reference_id: cartId,
    metadata: {
      phone: address.phone || "N/A",
      details: address.details || "N/A",
      country: address.country || "N/A",
      city: address.city || "N/A",
      postalCode: address.postalCode || "N/A",
    },
  });
  await logger.info("Stripe session created", { cartId });
  return session;
});

exports.stripeWebhookCheckoutService = asyncHandler(async (req) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;

  let event;

  if (!endpointSecret) {
    logger.error("STRIPE_WEBHOOK_SECRET_KEY is not defined.");
    throw new Error(
      "🛑 Webhook secret key is missing. Cannot verify Stripe signature."
    );
  }

  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      logger.error("Stripe signature header is missing.");
      throw new Error("🛑 Missing Stripe signature header.");
    }

    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    logger.info(`Stripe webhook event verified: ${event.type}`);
  } catch (err) {
    logger.error("Stripe webhook verification failed:", err.message);
    throw new Error("🛑 Invalid Stripe webhook signature.");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        const { order, user } = await createStripeCreditOrderService(session);

        await delCache("orders:all*");
        await delCache(`order:${order._id}`);

        await delCache(`cart:${user._id}`);
        await delCache(`cart:all*`);

        logger.info("Order created from Stripe session.");

        await createAndSendNotificationService({
          title: `New Order #${order.orderNumber}`,
          message: `User ${user.name} placed a new order`,
          module: "order",
          importance: "high",
          from: user.name,
        });

        await notifyModeratorsAboutOrder(order, user);
        break;

      case "checkout.session.async_payment_succeeded":
        logger.info("Payment succeeded asynchronously.");
        break;

      case "checkout.session.async_payment_failed":
        logger.warn("Async payment failed.");
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return { success: true, type: event.type };
  } catch (err) {
    logger.error(`Error handling Stripe event (${event.type}):`, err.message);
    throw new Error(`🛑 Failed to process Stripe event: ${event.type}`);
  }
});

exports.createPayMobSessionService = asyncHandler(async (req, user, cartId) => {
  aed;
  const { PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID } =
    process.env;

  const cart = await cartModel.findById(cartId);
  if (!cart) throw new ApiError("🛒 No cart found for this user", 404);
  const { total } = await calculateTotalPrice(cart);
  const totalOrderPrice = Number(total);

  const address = user.addresses?.[0] || {};
  try {
    const authRes = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: PAYMOB_API_KEY,
      }
    );
    const token = authRes.data.token;

    const orderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: (totalOrderPrice * 100).toString(),
        currency: "EGP",
        items: [],
      }
    );
    const orderId = orderRes.data.id;

    cart.paymobOrderId = orderId;
    await cart.save();

    const paymentKeyRes = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: (totalOrderPrice * 100).toString(),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: address.apartment || "N/A",
          email: user.email,
          floor: address.floor || "N/A",
          first_name: user.name?.split(" ")[0] || "User",
          street: address.details || "N/A",
          building: address.building || "N/A",
          phone_number: address.phone || "+201000000000",
          shipping_method: "PKG",
          postal_code: address.postalCode || "00000",
          city: address.city || "Cairo",
          country: address.country || "EG",
          last_name: user.name?.split(" ").slice(1).join(" ") || "Customer",
          state: address.city || "Cairo",
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID,
      }
    );

    const paymentToken = paymentKeyRes.data.token;
    const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

    logger.info("Paymob session created", { cartId });
    return iframeURL;
  } catch (err) {
    logger.error("Paymob error", err.response?.data || err.message);
    throw new ApiError("🛑 Error creating Paymob session", 500);
  }
});

exports.payMobWebhookCheckoutService = asyncHandler(async (event) => {
  if (
    event.type === "TRANSACTION" &&
    event.obj.success === true &&
    event.obj.order?.payment_status === "PAID"
  ) {
    const paymentData = event.obj;

    try {
      const { order, user } = await createPayMobCreditOrderService(paymentData);

      await delCache("orders:all*");
      await delCache(`order:${order._id}`);

      await delCache(`cart:${user._id}`);
      await delCache(`cart:all*`);

      logger.info(`Payment successful for Order ID ${paymentData.order.id}`, {
        amount: paymentData.amount_cents / 100,
      });

      await createAndSendNotificationService({
        title: `New Order #${order.orderNumber}`,
        message: `User ${user.name} placed a new order`,
        module: "order",
        importance: "high",
        from: user.name,
      });

      await notifyModeratorsAboutOrder(order, user);
    } catch (err) {
      logger.error("Failed to create order from Paymob webhook", err);
      throw new Error("🛑 Paymob webhook processing failed");
    }
  } else if (event.type !== "TRANSACTION") {
    logger.info(`Received non-transaction event: ${event.type}`);
  } else {
    logger.warn("Unsuccessful or irrelevant Paymob transaction", {
      event,
    });
  }
});

exports.updateOrderStatusService = asyncHandler(async (orderId, body) => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new ApiError("🧾 Order not found", 404);

  if (body.isPaid) {
    order.isPaid = true;
    order.paidAt = Date.now();
  }
  if (body.status === "delivered") {
    order.status = "delivered";
    order.deliveredAt = Date.now();
  } else {
    order.status = body.status;
  }

  await order.save();
  await delCache("orders:all*");
  await delCache(`order:${orderId}`);
  await logger.info("Order status updated", { orderId });
  return sanitize.sanitizeOrder(order);
});

exports.getAllOrdersService = asyncHandler(async (query, filter = {}) => {
  const key = `orders:all:${JSON.stringify(query)}`;

  const result = await cacheWrapper(key, async () => {
    const data = await getAllService(orderModel, query, "order", filter);
    return {
      ...data,
      data: data.data.map(sanitize.sanitizeOrder),
    };
  });

  return result;
});

exports.deleteOrderService = asyncHandler(async (orderId) => {
  await deleteService(orderModel, orderId);
  await delCache("orders:all*");
  await delCache(`order:${orderId}`);
  await logger.info("Order deleted", { orderId });
});
