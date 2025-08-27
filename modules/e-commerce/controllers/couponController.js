const asyncHandler = require("express-async-handler");

const {
  createCouponService,
  getCouponsService,
  getSpecificCouponService,
  updateCouponService,
  deleteCouponService,
} = require("../services/couponService");

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await createCouponService(req.body);
  res.status(201).json({
    message: "✅ Coupon created successfully",
    data: coupon,
  });
});

exports.getCoupons = asyncHandler(async (req, res) => {
  const result = await getCouponsService(req.query);
  res.status(200).json({
    message: "📦 Coupons fetched successfully",
    data: result,
  });
});

exports.getSpecificCoupon = asyncHandler(async (req, res) => {
  const coupon = await getSpecificCouponService(req.params.id);
  res.status(200).json({
    message: "✅ Coupon retrieved successfully",
    data: coupon,
  });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await updateCouponService(req.params.id, req.body);
  res.status(200).json({
    message: "🔄 Coupon updated successfully",
    data: coupon,
  });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await deleteCouponService(req.params.id);
  res.status(202).json({
    message: "🗑️ Coupon deleted successfully",
  });
});
