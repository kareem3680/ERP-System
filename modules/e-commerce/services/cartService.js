const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("cart");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const couponModel = require("../models/couponModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const { cacheWrapper, delCache } = require("../../../utils/cache");

const calculateCartPrice = (cart) => {
  const total = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  cart.totalPrice = Math.ceil(total / 5) * 5;
  cart.totalPriceAfterDiscount = undefined;
};

exports.getCartService = asyncHandler(async (userId) => {
  const key = `cart:${userId}`;

  const cart = await cacheWrapper(key, async () => {
    const data = await cartModel.findOne({ user: userId }).populate({
      path: "cartItems.product",
    });
    if (!data) throw new ApiError("🛒 No cart found for this user", 404);
    return sanitize.sanitizeCart(data);
  });

  return cart;
});

exports.addProductToCartService = asyncHandler(
  async (userId, { productId }) => {
    const product = await productModel.findById(productId);
    if (!product) throw new ApiError("🛑 Product not found", 404);

    if (product.quantity < 1) {
      throw new ApiError("🛑 Product is out of stock", 400);
    }

    const finalPrice =
      product.priceAfterDiscount > 0
        ? product.priceAfterDiscount
        : product.price;

    let cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      cart = await cartModel.create({
        user: userId,
        cartItems: [{ product: productId, price: finalPrice, quantity: 1 }],
      });
    } else {
      const index = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId
      );

      if (index >= 0) {
        const newQty = cart.cartItems[index].quantity + 1;
        if (newQty > product.quantity) {
          throw new ApiError("🛑 Not enough stock for this product", 400);
        }
        cart.cartItems[index].quantity = newQty;
      } else {
        cart.cartItems.push({
          product: productId,
          price: finalPrice,
          quantity: 1,
        });
      }
    }

    calculateCartPrice(cart);
    await cart.save();

    await delCache(`cart:${userId}`);

    await logger.info("Product added to cart", { userId });
    return sanitize.sanitizeCart(cart);
  }
);

exports.updateCartItemQtyService = asyncHandler(
  async (userId, itemId, quantity) => {
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) throw new ApiError("🛑 No cart found for this user", 404);

    const item = cart.cartItems.find((item) => item._id.toString() === itemId);
    if (!item) throw new ApiError("🛑 Product not found in cart", 404);

    const product = await productModel.findById(item.product);
    if (!product) throw new ApiError("🛑 Product not found", 404);

    if (quantity > product.quantity) {
      throw new ApiError("🛑 Not enough stock for this product", 400);
    }

    item.quantity = quantity;
    calculateCartPrice(cart);
    await cart.save();

    await delCache(`cart:${userId}`);

    await logger.info("Cart item quantity updated", { userId, itemId });
    return sanitize.sanitizeCart(cart);
  }
);

exports.removeProductFromCartService = asyncHandler(async (userId, itemId) => {
  const cart = await cartModel.findOneAndUpdate(
    { user: userId },
    { $pull: { cartItems: { _id: itemId } } },
    { new: true }
  );
  if (!cart) throw new ApiError("🛑 No cart found for this user", 404);

  calculateCartPrice(cart);
  await cart.save();

  await delCache(`cart:${userId}`);

  await logger.info("Product removed from cart", { userId, itemId });
  return sanitize.sanitizeCart(cart);
});

exports.clearCartService = asyncHandler(async (userId) => {
  await cartModel.findOneAndDelete({ user: userId });

  await delCache(`cart:${userId}`);

  await logger.info("Cart cleared", { userId });
});

exports.applyCouponToCartService = asyncHandler(async (userId, code) => {
  const coupon = await couponModel.findOne({
    code,
    expire: { $gt: Date.now() },
  });
  if (!coupon) throw new ApiError("🛑 Invalid or expired coupon code", 400);

  const cart = await cartModel.findOne({ user: userId });
  if (!cart) throw new ApiError("🛑 No cart found for this user", 404);

  cart.totalPriceAfterDiscount =
    Math.ceil((cart.totalPrice * (1 - coupon.discount / 100)) / 5) * 5;

  await cart.save();

  await delCache(`cart:${userId}`);

  await logger.info("Coupon applied", { userId, code });
  return sanitize.sanitizeCart(cart);
});
