const asyncHandler = require("express-async-handler");

const {
  createSaleTransactionService,
  createReturnTransactionService,
  getTransactionsService,
  getSpecificTransactionService,
} = require("../services/transactionService");

exports.createSaleTransaction = asyncHandler(async (req, res) => {
  const data = await createSaleTransactionService(req.body, req.user._id);
  res.status(201).json({
    message: "✅ Sale transaction created successfully",
    data,
  });
});

exports.createReturnTransaction = asyncHandler(async (req, res) => {
  const data = await createReturnTransactionService(req.body, req.user._id);
  res.status(201).json({
    message: "✅ Return transaction created successfully",
    data,
  });
});

exports.getTransactions = asyncHandler(async (req, res) => {
  const result = await getTransactionsService(req.query);
  res.status(200).json({
    message: "✅ Transactions fetched successfully",
    ...result,
  });
});

exports.getSpecificTransaction = asyncHandler(async (req, res) => {
  const transaction = await getSpecificTransactionService(req.params.id);
  res.status(200).json({
    message: "✅ Transaction fetched successfully",
    data: transaction,
  });
});
