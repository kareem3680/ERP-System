const asyncHandler = require("express-async-handler");

const {
  createProductService,
  getProductsService,
  getSpecificProductService,
  updateProductService,
  deleteProductService,
} = require("../services/productService");

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await createProductService(req.body, req);
  res.status(201).json({
    message: "✅ Product created successfully",
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await getProductsService(req.query);
  res.status(200).json({
    message: "✅ Products fetched successfully",
    ...products,
  });
});

exports.getSpecificProduct = asyncHandler(async (req, res) => {
  const product = await getSpecificProductService(req.params.id);
  res.status(200).json({
    message: "✅ Product fetched successfully",
    data: product,
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await updateProductService(req.params.id, req.body, req);
  res.status(200).json({
    message: "✅ Product updated successfully",
    data: product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const result = await deleteProductService(req.params.id);
  res.status(200).json({
    message: "🗑️ Product deleted successfully",
    ...result,
  });
});
