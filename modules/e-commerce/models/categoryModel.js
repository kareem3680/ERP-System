const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category name is required"],
      unique: [true, "category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [30, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("Category", categorySchema);

module.exports = categoryModel;
