const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transactionController");
const transactionValidator = require("../validators/transactionValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(
    authController.allowedTo("admin", "warehouse-manager", "auditor"),
    transactionController.getTransactions
  )
  .post(
    authController.allowedTo("admin", "warehouse-manager"),
    transactionValidator.createSaleTransactionValidator,
    transactionController.createSaleTransaction
  );

router
  .route("/return")
  .post(
    authController.allowedTo("admin", "warehouse-manager"),
    transactionValidator.createReturnTransactionValidator,
    transactionController.createReturnTransaction
  );

router
  .route("/:id")
  .get(
    authController.allowedTo("admin", "warehouse-manager", "auditor"),
    transactionValidator.getTransactionValidator,
    transactionController.getSpecificTransaction
  );

module.exports = router;
