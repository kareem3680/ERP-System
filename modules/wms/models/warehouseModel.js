const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Warehouse name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Warehouse location is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

const warehouseModel = mongoose.model("Warehouse", warehouseSchema);

module.exports = warehouseModel;
