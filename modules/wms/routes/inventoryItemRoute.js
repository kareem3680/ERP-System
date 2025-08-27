const express = require("express");
const router = express.Router();

const inventoryItemController = require("../controllers/inventoryItemController");
const inventoryItemValidator = require("../validators/inventoryItemValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(inventoryItemController.getInventoryItems)
  .post(
    authController.allowedTo("admin", "warehouse-manager"),
    inventoryItemValidator.createInventoryItemValidator,
    inventoryItemController.createInventoryItem
  );

router
  .route("/:id")
  .get(
    inventoryItemValidator.getInventoryItemValidator,
    inventoryItemController.getSpecificInventoryItem
  )
  .put(
    authController.allowedTo("admin", "warehouse-manager"),
    inventoryItemValidator.updateInventoryItemValidator,
    inventoryItemController.updateInventoryItem
  )
  .delete(
    authController.allowedTo("admin"),
    inventoryItemValidator.deleteInventoryItemValidator,
    inventoryItemController.deleteInventoryItem
  );

module.exports = router;
