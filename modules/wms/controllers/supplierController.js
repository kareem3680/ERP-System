const asyncHandler = require("express-async-handler");

const {
  createSupplierService,
  getSuppliersService,
  getSupplierByIdService,
  updateSupplierService,
  deleteSupplierService,
} = require("../services/supplierService");

exports.createSupplier = asyncHandler(async (req, res) => {
  const supplier = await createSupplierService(req.body);
  res.status(201).json({
    message: "✅ Supplier created successfully",
    data: supplier,
  });
});

exports.getSuppliers = asyncHandler(async (req, res) => {
  const result = await getSuppliersService(req.query);
  res.status(200).json({
    message: "📦 Suppliers fetched successfully",
    data: result,
  });
});

exports.getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await getSupplierByIdService(req.params.id);
  res.status(200).json({
    message: "📦 Supplier fetched",
    data: supplier,
  });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await updateSupplierService(req.params.id, req.body);
  res.status(200).json({
    message: "✅ Supplier updated successfully",
    data: supplier,
  });
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  await deleteSupplierService(req.params.id);
  res.status(200).json({
    message: "🗑️ Supplier deleted successfully",
  });
});
