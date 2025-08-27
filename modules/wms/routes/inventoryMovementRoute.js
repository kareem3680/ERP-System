const express = require("express");
const router = express.Router();

const controller = require("../controllers/inventoryMovementController");
const validator = require("../validators/inventoryMovementValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.allowedTo("admin", "operation-manager", "auditor"),
    controller.getInventoryMovements
  )
  .post(
    authController.allowedTo("admin", "operation-manager"),
    validator.createInventoryMovementValidator,
    controller.createInventoryMovement
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "operation-manager", "auditor"),
    validator.getInventoryMovementValidator,
    controller.getInventoryMovementById
  );

module.exports = router;
