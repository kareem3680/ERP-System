const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Transaction must reference a warehouse"],
    },
    type: {
      type: String,
      enum: ["sale", "return"],
      required: [true, "Transaction type is required"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
    returnOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Transaction must reference the user who created it"],
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// auto-generate transactionNumber e.g. TN-24-0001
transactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = `TN-${year}`;

    const lastTransaction = await this.constructor
      .findOne({ transactionNumber: new RegExp(`^${prefix}`) })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastTransaction && lastTransaction.transactionNumber) {
      const lastNum = parseInt(
        lastTransaction.transactionNumber.split("-")[2],
        10
      );
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    this.transactionNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;
  }
  next();
});

transactionSchema.pre(/^find/, function (next) {
  this.populate([
    { path: "order", select: "orderNumber totalOrderPrice" },
    { path: "warehouse", select: "name location" },
    { path: "items.product", select: "title imageCover" },
    { path: "createdBy", select: "name email" },
  ]);
  next();
});

transactionSchema.index({ transactionNumber: 1 }, { unique: true });

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;
