const clientRoute = require("./clientRoute");
const projectRoute = require("./projectRoute");
const taskRoute = require("./taskRoute");
const dashboardRoute = require("./dashboardRoutes");

const mountRoutes = (app) => {
  app.use("/api/v1/clients", clientRoute);
  app.use("/api/v1/projects", projectRoute);
  app.use("/api/v1/tasks", taskRoute);
  app.use("/api/v1/dashboard", dashboardRoute);
};

module.exports = mountRoutes;
