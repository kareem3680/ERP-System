const notificationRoute = require("./notificationRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/notifications", notificationRoute);
};

module.exports = mountRoutes;
