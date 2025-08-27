const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    cartPrice: {
      type: Number,
    },
    taxes: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash on delivery",
        "onlinePayment-Stripe",
        "onlinePayment-Paymob",
      ],
      default: "cash on delivery",
      required: [true, "Payment method is required"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "Approved", "delivered", "cancelled"],
      default: "pending",
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const year = new Date().getFullYear().toString().slice(-2);
    const yearPrefix = `ON-${year}`;

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

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer",
    select: "name email addresses -_id",
  }).populate({
    path: "items.product",
    select: "title imageCover",
  });
  next();
});

orderSchema.index({ orderNumber: 1 }, { unique: true });

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
