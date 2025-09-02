require("colors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Product = require("../modules/e-commerce/models/productModel");
const dbConnection = require("../config/dataBase");
const logger = new (require("../utils/loggerService"))("product");
const { delCache } = require("../utils/cache");

// Load environment variables
dotenv.config({ path: "../config.env" });

// Connect to DB
dbConnection();

// ---------------------- Helpers ----------------------

const clearProductCache = async (productIds) => {
  try {
    if (productIds && productIds.length > 0) {
      await delCache("products:all*");
      for (const id of productIds) {
        await delCache(`product:${id}`);
      }
    } else {
      // لو Reset لكل المنتجات
      await delCache("products:all*");
    }
    console.log("🧹 Product cache cleared".blue.inverse);
    await logger.info("Product cache cleared", { ids: productIds });
  } catch (err) {
    console.error("Error clearing cache:".red.inverse, err);
  }
};

// ---------------------- Actions ----------------------

const applyDiscountByIds = async (productIds, discountPercentage) => {
  try {
    if (!productIds || productIds.length === 0) {
      console.log("No product IDs provided.".red.inverse);
      process.exit(1);
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      console.log("❌ Discount must be between 0 and 100".red.inverse);
      process.exit(1);
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      {
        $set: {
          discountPercentage,
        },
      }
    );

    console.log(
      `✅ Discount (${discountPercentage}%) applied to ${result.modifiedCount} products.`
        .green.inverse
    );
    await logger.info("Discount applied", {
      count: result.modifiedCount,
      discountPercentage,
    });

    await clearProductCache(productIds);
    process.exit(0);
  } catch (error) {
    console.error("Error applying discount:".red.inverse, error);
    await logger.error("Error applying discount", { error: error.message });
    process.exit(1);
  }
};

const removeDiscountByIds = async (productIds) => {
  try {
    if (!productIds || productIds.length === 0) {
      console.log("No product IDs provided.".red.inverse);
      process.exit(1);
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      {
        $unset: { discountPercentage: "" },
        $set: { priceAfterDiscount: "$price" },
      }
    );

    console.log(
      `✅ Discount removed from ${result.modifiedCount} products.`.green.inverse
    );
    await logger.info("Discount removed", {
      count: result.modifiedCount,
    });

    await clearProductCache(productIds);
    process.exit(0);
  } catch (error) {
    console.error("Error removing discount:".red.inverse, error);
    await logger.error("Error removing discount", { error: error.message });
    process.exit(1);
  }
};

const resetAllDiscounts = async () => {
  try {
    const result = await Product.updateMany(
      {},
      {
        $unset: { discountPercentage: "" },
        $set: { priceAfterDiscount: "$price" },
      }
    );

    console.log(
      `🔄 All discounts removed from ${result.modifiedCount} products.`.green
        .inverse
    );
    await logger.info("All discounts reset", {
      count: result.modifiedCount,
    });

    await clearProductCache();
    process.exit(0);
  } catch (error) {
    console.error("Error resetting discounts:".red.inverse, error);
    await logger.error("Error resetting discounts", { error: error.message });
    process.exit(1);
  }
};

// ---------------------- CLI Handling ----------------------

// Usage:
// node discountScript.js -i 50 60a... 60b...  => Apply 50% discount
// node discountScript.js -d 60a... 60b...     => Remove discount by IDs
// node discountScript.js -r                   => Reset all discounts

const action = process.argv[2]; // -i | -d | -r
const discountPercentage = Number(process.argv[3]) || 0;
let productIds = [];

if (action === "-i") {
  productIds.push(...process.argv.slice(4));
  applyDiscountByIds(productIds, discountPercentage);
} else if (action === "-d") {
  productIds.push(...process.argv.slice(3));
  removeDiscountByIds(productIds);
} else if (action === "-r") {
  resetAllDiscounts();
} else {
  console.log(
    "Invalid action. Use:\n'-i <discount%> <ids...>' to apply discount\n'-d <ids...>' to remove discount\n'-r' to reset all discounts."
      .yellow.inverse
  );
  process.exit(1);
}
