const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Purchase order must reference a supplier"],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Purchase order must reference a warehouse"],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "received", "closed", "cancelled"],
      default: "draft",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Order item must reference an product"],
        },
        quantity: {
          type: Number,
          required: [true, "Order item must have a quantity"],
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: [true, "Order item must have a unit price"],
          min: [0, "Unit price cannot be negative"],
        },
        total: {
          type: Number,
          min: [0, "Total cannot be negative"],
        },
      },
    ],
    subTotal: {
      type: Number,
      min: [0, "Subtotal cannot be negative"],
    },
    taxes: {
      type: Number,
      default: 0,
      min: [0, "Taxes cannot be negative"],
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, "shipping cannot be negative"],
    },
    totalAmount: {
      type: Number,
      min: [0, "Total amount cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

function calculateTotals(doc) {
  if (doc.items && Array.isArray(doc.items)) {
    doc.items.forEach((item) => {
      item.total = item.quantity * item.unitPrice;
    });
    doc.subTotal = doc.items.reduce((sum, item) => sum + item.total, 0);
    doc.totalAmount = doc.subTotal + (doc.taxes || 0) + (doc.shipping || 0);
  }
}

purchaseOrderSchema.pre("save", async function (next) {
  calculateTotals(this);

  if (this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const yearPrefix = `PO-${year}`;

    const lastOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^${yearPrefix}`) })
      .sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastNum = parseInt(lastOrder.orderNumber.split("-")[2], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    this.orderNumber = `${yearPrefix}-${String(nextNumber).padStart(4, "0")}`;
  }

  next();
});

purchaseOrderSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
  const update = this.getUpdate();

  if (update.items && Array.isArray(update.items)) {
    update.items.forEach((item) => {
      if (item.quantity != null && item.unitPrice != null) {
        item.total = item.quantity * item.unitPrice;
      }
    });
    update.subTotal = update.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    update.totalAmount =
      update.subTotal + (update.taxes || 0) + (update.shipping || 0);

    this.setUpdate(update);
  }

  next();
});

purchaseOrderSchema.index({ orderNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ warehouse: 1 });

const PurchaseOrderModel = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrderModel;
