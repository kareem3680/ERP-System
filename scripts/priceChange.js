require("colors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const categoryModel = require("../models/categoryModel");
const subCategoryModel = require("../models/subCategoryModel");
const brandModel = require("../models/brandModel");
const dbConnection = require("../config/dataBase");

// Load environment variables
dotenv.config({ path: "../config.env" });

// Connect to DB
dbConnection();

const applyDiscountByIds = async (productIds, discountPercentage) => {
  try {
    if (!productIds || productIds.length === 0) {
      console.log("No product IDs provided.".red.inverse);
      return;
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (!products.length) {
      console.log("No products found for the given IDs.".red.inverse);
      return;
    }

    console.log(`Found ${products.length} products. Applying discount...`);

    for (const product of products) {
      product.discountPercentage = discountPercentage;
      await product.save(); // Ensure mongoose middleware works
    }

    console.log("Discount applied successfully to all products.".green.inverse);
  } catch (error) {
    console.error("Error applying discount:".red.inverse, error);
    process.exit(1);
  }
};

const removeDiscountByIds = async (productIds) => {
  try {
    if (!productIds || productIds.length === 0) {
      console.log("No product IDs provided.".red.inverse);
      return;
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (!products.length) {
      console.log("No products found for the given IDs.".red.inverse);
      return;
    }

    console.log(`Found ${products.length} products. Removing discount...`);

    for (const product of products) {
      product.discountPercentage = undefined;
      product.priceAfterDiscount = product.price;
      await product.save(); // Ensure mongoose middleware works
    }

    console.log(
      "Discount removed successfully from all products.".green.inverse
    );
  } catch (error) {
    console.error("Error removing discount:".red.inverse, error);
    process.exit(1);
  }
};

// Fetch arguments from the command line
const action = process.argv[2]; // "-i" for applying discount, "-d" for removing discount

const productIds = [
  "67719a5bbb06e77643564b76",
  "67719a5bbb06e77643564b79",
  "67719a5bbb06e77643564b7a",
  "67719a5bbb06e77643564b7b",
  "67719a5bbb06e77643564b7c",
  "67719a5bbb06e77643564b77",
  "67719a5bbb06e77643564b7e",
  "67719a5bbb06e77643564b78",
  "67719a5bbb06e77643564b7d",
  "67719a5bbb06e77643564b7f",
];
const discountPercentage = 50;

if (action === "-i") {
  applyDiscountByIds(productIds, discountPercentage).then(() =>
    mongoose.disconnect()
  );
} else if (action === "-d") {
  removeDiscountByIds(productIds).then(() => mongoose.disconnect());
} else {
  console.log(
    "Invalid action. Use '-i' to apply discount or '-d' to remove discount."
      .yellow.inverse
  );
  mongoose.disconnect();
}
