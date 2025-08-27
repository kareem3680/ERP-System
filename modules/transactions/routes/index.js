const transactionRoute = require("./transactionRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/transactions", transactionRoute);
};

module.exports = mountRoutes;
