const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("coupon");
const couponModel = require("../models/couponModel");
const ApiError = require("../../../utils/apiError");
const sanitize = require("../../../utils/sanitizeData");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createCouponService = asyncHandler(async (body) => {
  body.code = body.code.toUpperCase();

  const exists = await couponModel.findOne({ code: body.code });
  if (exists) {
    await logger.error("Coupon creation failed - code already exists", {
      code: body.code,
    });
    throw new ApiError("🛑 Coupon code already exists", 400);
  }

  const newCoupon = await createService(couponModel, body);
  await logger.info("Coupon created", {
    id: newCoupon._id,
    code: newCoupon.code,
  });
  return sanitize.sanitizeCoupon(newCoupon);
});

exports.getCouponsService = asyncHandler(async (query) => {
  const result = await getAllService(couponModel, query, "coupon");
  await logger.info("Fetched all coupons");
  return {
    ...result,
    data: result.data.map(sanitize.sanitizeCoupon),
  };
});

exports.getSpecificCouponService = asyncHandler(async (id) => {
  const coupon = await getSpecificService(couponModel, id);
  await logger.info("Fetched coupon", { id });
  return sanitize.sanitizeCoupon(coupon);
});

exports.updateCouponService = asyncHandler(async (id, body) => {
  if (body.code) {
    body.code = body.code.toUpperCase();
    const exists = await couponModel.findOne({
      code: body.code,
      _id: { $ne: id },
    });
    if (exists) {
      await logger.error("Coupon update failed - code already exists", {
        code: body.code,
      });
      throw new ApiError("🛑 Coupon code already exists", 400);
    }
  }

  const updatedCoupon = await updateService(couponModel, id, body);
  await logger.info("Coupon updated", { id });
  return sanitize.sanitizeCoupon(updatedCoupon);
});

exports.deleteCouponService = asyncHandler(async (id) => {
  const result = await deleteService(couponModel, id);
  await logger.info("Coupon deleted", { id });
  return result;
});
