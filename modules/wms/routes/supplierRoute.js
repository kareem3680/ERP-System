const express = require("express");
const router = express.Router();

const authController = require("../../../modules/identity/controllers/authController");
const supplierController = require("../controllers/supplierController");
const supplierValidator = require("../validators/supplierValidator");

router.use(authController.protect);
router.use(authController.allowedTo("admin", "operation-manager"));

router
  .route("/")
  .post(
    supplierValidator.createSupplierValidator,
    supplierController.createSupplier
  )
  .get(supplierController.getSuppliers);

router
  .route("/:id")
  .get(
    supplierValidator.getSupplierValidator,
    supplierController.getSupplierById
  )
  .put(
    supplierValidator.updateSupplierValidator,
    supplierController.updateSupplier
  )
  .delete(
    authController.protect,
    supplierValidator.deleteSupplierValidator,
    supplierController.deleteSupplier
  );

module.exports = router;
