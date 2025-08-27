const asyncHandler = require("express-async-handler");

const {
  getCartService,
  addProductToCartService,
  updateCartItemQtyService,
  removeProductFromCartService,
  clearCartService,
  applyCouponToCartService,
} = require("../services/cartService");

exports.getAllProductsInCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user._id);
  res.status(200).json({
    results: cart.cartItems.length,
    message: "🛒 Cart fetched successfully",
    data: cart,
  });
});

exports.addProductToCart = asyncHandler(async (req, res) => {
  const cart = await addProductToCartService(req.user._id, req.body);
  res.status(200).json({
    results: cart.cartItems.length,
    message: "✅ Product added to cart",
    data: cart,
  });
});

exports.updateProductQuantityInCart = asyncHandler(async (req, res) => {
  const cart = await updateCartItemQtyService(
    req.user._id,
    req.params.id,
    req.body.quantity
  );
  res.status(200).json({
    results: cart.cartItems.length,
    message: "🔄 Product quantity updated",
    data: cart,
  });
});

exports.removeProductFromCart = asyncHandler(async (req, res) => {
  const cart = await removeProductFromCartService(req.user._id, req.params.id);
  res.status(200).json({
    message: "🗑️ Product removed from cart",
    data: cart,
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await clearCartService(req.user._id);
  res.status(202).json({
    message: "🧹 Cart cleared successfully",
  });
});

exports.applyCouponToCart = asyncHandler(async (req, res) => {
  const cart = await applyCouponToCartService(req.user._id, req.body.code);
  res.status(200).json({
    results: cart.cartItems.length,
    message: "🏷️ Coupon applied successfully",
    data: cart,
  });
});
