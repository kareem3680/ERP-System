const express = require("express");
const router = express.Router();

const couponController = require("../controllers/couponController");
const couponValidator = require("..//validators/couponValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.allowedTo("admin", "moderator"),
    couponController.getCoupons
  )
  .post(
    authController.allowedTo("admin"),
    couponValidator.createCouponValidator,
    couponController.createCoupon
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "moderator"),
    couponValidator.getCouponValidator,
    couponController.getSpecificCoupon
  )
  .put(
    authController.protect,
    authController.allowedTo("admin"),
    couponValidator.updateCouponValidator,
    couponController.updateCoupon
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    couponValidator.deleteCouponValidator,
    couponController.deleteCoupon
  );

module.exports = router;
