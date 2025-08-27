const asyncHandler = require("express-async-handler");

const {
  addProductToWishlistService,
  removeProductFromWishlistService,
  getAllWishlistsService,
} = require("../services/wishlistService");

exports.addProductToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await addProductToWishlistService(
    req.user._id,
    req.body.productId
  );

  res.status(200).json({
    message: "💖 Product added to wishlist successfully",
  });
});

exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await removeProductFromWishlistService(
    req.user._id,
    req.params.id
  );
  res.status(200).json({
    message: "🗑️	 Product removed from wishlist successfully",
    data: wishlist,
  });
});

exports.getAllWishlists = asyncHandler(async (req, res) => {
  const wishlist = await getAllWishlistsService(req.user._id);
  res.status(200).json({
    results: wishlist.length,
    message: "📦 Wishlist fetched successfully",
    data: wishlist,
  });
});
