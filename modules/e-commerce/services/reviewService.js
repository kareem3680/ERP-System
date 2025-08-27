const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("review");
const reviewModel = require("../models/reviewModel");
const productModel = require("../models/productModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createReviewService = asyncHandler(async (body, req) => {
  const product = await productModel.findById(body.product);
  if (!product) {
    await logger.error("Product not found", { product: body.product });
    throw new ApiError("🛑 Product not found", 404);
  }

  const existing = await reviewModel.findOne({
    user: req.user._id,
    product: body.product,
  });
  if (existing) {
    await logger.error("Duplicate review", { user: req.user._id });
    throw new ApiError("🛑 You already reviewed this product", 400);
  }

  const review = await createService(reviewModel, body);

  await delCache("reviews:all*");
  await delCache(`review:${review._id}`);

  await logger.info("Review created", { id: review._id });
  return sanitize.sanitizeReview(review);
});

exports.getAllReviewsService = asyncHandler(async (req) => {
  return cacheWrapper("reviews:all", async () => {
    const result = await getAllService(
      reviewModel,
      req.query,
      "review",
      req.filterObject
    );
    await logger.info("Fetched all reviews");
    return {
      ...result,
      data: result.data.map(sanitize.sanitizeReview),
    };
  });
});

exports.getSpecificReviewService = asyncHandler(async (id) => {
  return cacheWrapper(`review:${id}`, async () => {
    const review = await getSpecificService(reviewModel, id);
    if (!review) {
      await logger.error("Review not found", { id });
      throw new ApiError(`🛑 No review found for ID: ${id}`, 404);
    }
    await logger.info("Fetched review", { id });
    return sanitize.sanitizeReview(review);
  });
});

exports.updateReviewService = asyncHandler(async (id, body, req) => {
  const review = await reviewModel.findById(id);
  if (!review) {
    await logger.error("Review to update not found", { id });
    throw new ApiError(`🛑 No review found for ID: ${id}`, 404);
  }

  if (review.user._id.toString() !== req.user._id.toString()) {
    await logger.error("Unauthorized update attempt", { id });
    throw new ApiError("⛔ Unauthorized", 403);
  }

  const updated = await updateService(reviewModel, id, body);

  await delCache("reviews:all*");
  await delCache(`review:${id}`);

  await logger.info("Review updated", { id });
  return sanitize.sanitizeReview(updated);
});

exports.deleteReviewService = asyncHandler(async (id, req) => {
  const review = await reviewModel.findById(id);
  if (!review) {
    await logger.error("Review to delete not found", { id });
    throw new ApiError(`🛑 No review found for ID: ${id}`, 404);
  }

  if (
    req.user.role === "user" &&
    review.user.toString() !== req.user._id.toString()
  ) {
    await logger.error("Unauthorized delete attempt", { id });
    throw new ApiError("⛔ Unauthorized", 403);
  }

  await deleteService(reviewModel, id);

  await delCache("reviews:all*");
  await delCache(`review:${id}`);

  await logger.info("Review deleted", { id });
  return true;
});
