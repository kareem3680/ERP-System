const warehouseRoute = require("./warehouseRoute");
const inventoryItemRoute = require("./inventoryItemRoute");
const inventoryMovementRoute = require("./inventoryMovementRoute");
const supplierRoute = require("./supplierRoute");
const purchaseOrderRoute = require("./purchaseOrderRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/warehouses", warehouseRoute);
  app.use("/api/v1/inventory-items", inventoryItemRoute);
  app.use("/api/v1/inventory-movements", inventoryMovementRoute);
  app.use("/api/v1/suppliers", supplierRoute);
  app.use("/api/v1/purchase-orders", purchaseOrderRoute);
};

module.exports = mountRoutes;
