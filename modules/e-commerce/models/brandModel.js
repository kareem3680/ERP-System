const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: [true, "Brand must be unique"],
      minlength: [3, "Too short Brand name"],
      maxlength: [30, "Too long Brand name"],
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

const brandModel = mongoose.model("Brand", brandSchema);

module.exports = brandModel;
