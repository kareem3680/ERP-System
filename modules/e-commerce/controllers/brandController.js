const asyncHandler = require("express-async-handler");

const {
  createBrandService,
  getBrandsService,
  getSpecificBrandService,
  updateBrandService,
  deleteBrandService,
} = require("../services/brandService");

exports.createBrand = asyncHandler(async (req, res) => {
  const brand = await createBrandService(req.body, req);
  res.status(201).json({
    message: "✅ Brand created successfully",
    data: brand,
  });
});

exports.getBrands = asyncHandler(async (req, res) => {
  const result = await getBrandsService(req.query);
  res.status(200).json({
    message: "🏷️ Brands fetched successfully",
    data: result,
  });
});

exports.getSpecificBrand = asyncHandler(async (req, res) => {
  const brand = await getSpecificBrandService(req.params.id);
  res.status(200).json({
    message: "✅ Brand retrieved successfully",
    data: brand,
  });
});

exports.updateBrand = asyncHandler(async (req, res) => {
  const brand = await updateBrandService(req.params.id, req.body, req);
  res.status(200).json({
    message: "🔄 Brand updated successfully",
    data: brand,
  });
});

exports.deleteBrand = asyncHandler(async (req, res) => {
  await deleteBrandService(req.params.id);
  res.status(202).json({
    message: "✅ Brand deleted successfully",
  });
});
