const express = require("express");
const router = express.Router();

const authController = require("../../identity/controllers/authController");
const orderController = require("../controllers/orderController");
const orderValidator = require("../validators/orderValidator");

router
  .route("/payMob-webhook-checkout")
  .post(orderController.payMobWebhookCheckout);

router
  .route("/")
  .get(
    authController.protect,
    orderController.filterOrderForUsers,
    orderController.getAllOrders
  );

router
  .route("/:id")
  .post(
    authController.protect,
    authController.allowedTo("user"),
    orderValidator.createCashOrderValidator,
    orderController.createCashOrder
  );

router
  .route("/stripe-checkout-session/:id")
  .get(
    authController.protect,
    authController.allowedTo("user"),
    orderController.stripeCheckOutSession
  );

router
  .route("/payMob-checkout-session/:id")
  .get(
    authController.protect,
    authController.allowedTo("user"),
    orderController.payMobCheckOutSession
  );

router
  .route("/:id")
  .put(
    authController.protect,
    authController.allowedTo("admin", "moderator"),
    orderValidator.updateOrderStatusValidator,
    orderController.updateOrderStatus
  );

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    orderValidator.deleteOrderValidator,
    orderController.deleteOrder
  );

module.exports = router;
