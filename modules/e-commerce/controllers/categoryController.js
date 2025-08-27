const asyncHandler = require("express-async-handler");

const {
  createCategoryService,
  getCategoriesService,
  getSpecificCategoryService,
  updateCategoryService,
  deleteCategoryService,
} = require("../services/categoryService");

exports.createCategory = asyncHandler(async (req, res) => {
  const newCategory = await createCategoryService(req.body, req);
  res.status(201).json({
    message: "✅ Category created successfully",
    data: newCategory,
  });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const result = await getCategoriesService(req.query);
  res.status(200).json({
    message: "📂 Categories fetched successfully",
    data: result,
  });
});

exports.getSpecificCategory = asyncHandler(async (req, res) => {
  const category = await getSpecificCategoryService(req.params.id);
  res.status(200).json({
    message: "✅ Category retrieved successfully",
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const updatedCategory = await updateCategoryService(
    req.params.id,
    req.body,
    req
  );
  res.status(200).json({
    message: "🔄 Category updated successfully",
    data: updatedCategory,
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await deleteCategoryService(req.params.id);
  res.status(202).json({
    message: "✅ Category deleted successfully",
  });
});
