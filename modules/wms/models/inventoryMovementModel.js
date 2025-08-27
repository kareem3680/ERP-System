const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Movement must reference a product"],
    },
    type: {
      type: String,
      required: true,
      enum: ["in", "out", "transfer", "reclassify", "adjust"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Movement quantity must be at least 1"],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    fromWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    toWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    sourceStatus: {
      type: String,
      enum: ["quantityOnHand", "reservedQuantity", "damagedQuantity"],
    },
    targetStatus: {
      type: String,
      enum: ["quantityOnHand", "reservedQuantity", "damagedQuantity"],
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
