const authRoute = require("./authRoute");
const updatePasswordRoute = require("./updatePasswordRoute");
const forgetPasswordRoute = require("./forgetPasswordRoute");
const adminRoute = require("./adminRoute");
const userRoute = require("./userRoute");
const addressRoute = require("./addressRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/updatePassword", updatePasswordRoute);
  app.use("/api/v1/forgetPassword", forgetPasswordRoute);
  app.use("/api/v1/adminDashboard", adminRoute);
  app.use("/api/v1/userDashboard", userRoute);
  app.use("/api/v1/addresses", addressRoute);
};

module.exports = mountRoutes;
