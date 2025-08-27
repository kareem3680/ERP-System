const mongoose = require("mongoose");
const productModel = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "review rating is required"],
      min: [1, "rating must be at least 1"],
      max: [5, "rating must be maximum 5"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to User"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "review must belong to product"],
    },
  },
  { timestamps: true }
);

reviewSchema.statics.calcAverageAndQuantity = async function (productId) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: productId,
        avgRatings: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);
  if (result.length > 0) {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingQuantity,
    });
  } else {
    await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageAndQuantity(this.product);
});

reviewSchema.post("findOneAndDelete", async (doc) => {
  await doc.constructor.calcAverageAndQuantity(doc.product);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
