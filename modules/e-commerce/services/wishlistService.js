const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("wishlist");
const userModel = require("../../identity/models/userModel");
const productModel = require("../models/productModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");

exports.addProductToWishlistService = asyncHandler(
  async (userId, productId) => {
    if (!productId || typeof productId !== "string") {
      await logger.error("Invalid product ID format", { productId });
      throw new ApiError("🛑 Invalid product ID", 400);
    }

    const productExists = await productModel.findById(productId);
    if (!productExists) {
      await logger.error("Add to wishlist failed - product not found", {
        productId,
      });
      throw new ApiError("🛑 Product not found", 404);
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );

    await logger.info("Product added to wishlist", { userId, productId });
    return user.wishlist;
  }
);

exports.removeProductFromWishlistService = asyncHandler(
  async (userId, productId) => {
    const productExists = await productModel.findById(productId);
    if (!productExists) {
      await logger.error("Remove from wishlist failed - product not found", {
        productId,
      });
      throw new ApiError("🛑 Product not found", 404);
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    await logger.info("Product removed from wishlist", { userId, productId });
    return user.wishlist;
  }
);

exports.getAllWishlistsService = asyncHandler(async (userId) => {
  const user = await userModel.findById(userId).populate("wishlist");
  await logger.info("Fetched wishlist for user", { userId });

  return user.wishlist.map(sanitize.sanitizeProduct);
});
