const express = require("express");
const router = express.Router();

const purchaseOrderController = require("../controllers/purchaseOrderController");
const purchaseOrderValidator = require("../validators/purchaseOrderValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);
router.use(authController.allowedTo("admin", "operation-manager"));

router
  .route("/")
  .get(purchaseOrderController.getPurchaseOrders)
  .post(
    purchaseOrderValidator.createPurchaseOrderValidator,
    purchaseOrderController.createPurchaseOrder
  );

router
  .route("/:id")
  .get(
    purchaseOrderValidator.getPurchaseOrderValidator,
    purchaseOrderController.getPurchaseOrder
  )
  .put(
    purchaseOrderValidator.updatePurchaseOrderValidator,
    purchaseOrderController.updatePurchaseOrder
  )
  .delete(
    purchaseOrderValidator.deletePurchaseOrderValidator,
    purchaseOrderController.deletePurchaseOrder
  );

module.exports = router;
