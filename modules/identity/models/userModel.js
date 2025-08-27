const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      minlength: [3, "Too short name"],
      maxlength: [30, "Too long name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email must be unique"],
      lowercase: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      minlength: [5, "Password must be at least 5 character"],
    },
    profileImage: {
      type: String,
    },
    changedPasswordAt: {
      type: Date,
    },
    passwordResetCode: {
      type: String,
    },
    passwordResetCodeExpiresAt: {
      type: Date,
    },
    passwordResetCodeVerified: {
      type: Boolean,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    verifyEmailCode: {
      type: Number,
    },
    verifyEmailExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "operation-manager",
        "warehouse-manager",
        "moderator",
        "auditor",
        "user",
      ],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        phone: String,
        details: String,
        country: String,
        city: String,
        postalCode: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
