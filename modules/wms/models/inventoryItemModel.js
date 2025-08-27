const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Inventory item must reference a product"],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Inventory item must reference a warehouse"],
    },
    quantityOnHand: {
      type: Number,
      required: true,
      min: [0, "Quantity on hand can't be negative"],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Reserved quantity can't be negative"],
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: [0, "Damaged quantity can't be negative"],
    },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ product: 1, warehouse: 1 }, { unique: true });

const warehouseModel = mongoose.model("InventoryItem", inventoryItemSchema);

module.exports = warehouseModel;
