const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "subCategory name is required"],
      minlength: [3, "Too short subCategory name"],
      maxlength: [30, "Too long subCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subCategory must belong to main category"],
    },
  },
  { timestamps: true }
);
const subCategoryModel = mongoose.model("subCategory", subCategorySchema);

module.exports = subCategoryModel;
