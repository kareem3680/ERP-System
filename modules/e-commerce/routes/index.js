const categoryRoute = require("./categoryRoute");
const subCategoryRoute = require("./subCategoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const wishlistRoute = require("./wishlistRoute");
const reviewRoute = require("./reviewRoute");
const couponRoute = require("./couponRoute");
const settingRoute = require("./settingRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/sub-categories", subCategoryRoute);
  app.use("/api/v1/brands", brandRoute);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/wishlists", wishlistRoute);
  app.use("/api/v1/reviews", reviewRoute);
  app.use("/api/v1/coupons", couponRoute);
  app.use("/api/v1/settings", settingRoute);
  app.use("/api/v1/carts", cartRoute);
  app.use("/api/v1/orders", orderRoute);
};

module.exports = mountRoutes;
