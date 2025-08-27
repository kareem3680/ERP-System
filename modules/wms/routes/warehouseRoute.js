const express = require("express");
const router = express.Router();

const warehouseController = require("../controllers/warehouseController");
const warehouseValidator = require("../validators/warehouseValidator");
const authController = require("../../identity/controllers/authController");

router
  .route("/")
  .get(warehouseController.getWarehouses)
  .post(
    authController.protect,
    authController.allowedTo("admin", "operation-manager"),
    warehouseValidator.createWarehouseValidator,
    warehouseController.createWarehouse
  );

router
  .route("/:id")
  .get(
    warehouseValidator.getWarehouseValidator,
    warehouseController.getSpecificWarehouse
  )
  .put(
    authController.protect,
    authController.allowedTo("admin", "operation-manager"),
    warehouseValidator.updateWarehouseValidator,
    warehouseController.updateWarehouse
  )
  .delete(
    authController.protect,
    authController.allowedTo("admin"),
    warehouseValidator.deleteWarehouseValidator,
    warehouseController.deleteWarehouse
  );

module.exports = router;
