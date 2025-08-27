const asyncHandler = require("express-async-handler");

const {
  createReviewService,
  getAllReviewsService,
  getSpecificReviewService,
  updateReviewService,
  deleteReviewService,
} = require("../services/reviewService");

exports.setRoutes = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject.product = req.params.productId;
  req.filterObject = filterObject;
  next();
};

exports.createReview = asyncHandler(async (req, res) => {
  const review = await createReviewService(req.body, req);
  res.status(201).json({
    message: "✅ Review created successfully",
    data: review,
  });
});

exports.getAllReviews = asyncHandler(async (req, res) => {
  const result = await getAllReviewsService(req);
  res.status(200).json({
    results: result.results,
    message: "🎯 All reviews retrieved successfully",
    data: result.data,
  });
});

exports.getSpecificReview = asyncHandler(async (req, res) => {
  const review = await getSpecificReviewService(req.params.id);
  res.status(200).json({
    message: "📄 Review retrieved successfully",
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const updated = await updateReviewService(req.params.id, req.body, req);
  res.status(200).json({
    message: "🔄 Review updated successfully",
    data: updated,
  });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  await deleteReviewService(req.params.id, req);
  res.status(202).json({
    message: "🗑️ Review deleted successfully",
  });
});
