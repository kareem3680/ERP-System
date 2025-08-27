const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Coupon code is required"],
    unique: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: [true, "Coupon discount is required"],
    min: [0, "Discount must be at least 0"],
    max: [100, "Discount must be maximum 100"],
  },
  expire: {
    type: Date,
    required: [true, "Coupon expire is required"],
  },
});

const couponModel = mongoose.model("Coupon", couponSchema);

module.exports = couponModel;
