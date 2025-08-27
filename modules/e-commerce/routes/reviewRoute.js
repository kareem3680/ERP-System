const express = require("express");
const router = express.Router({ mergeParams: true });

const reviewController = require("../controllers/reviewController");
const reviewValidator = require("../validators/reviewValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(reviewController.createFilterObject, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.allowedTo("user"),
    reviewController.setRoutes,
    reviewValidator.createReviewValidator,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewValidator.getReviewValidator, reviewController.getSpecificReview)
  .put(
    authController.protect,
    authController.allowedTo("user"),
    reviewValidator.updateReviewValidator,
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    reviewValidator.deleteReviewValidator,
    reviewController.deleteReview
  );

module.exports = router;
