const asyncHandler = require("express-async-handler");

const {
  createSubCategoryService,
  getSubCategoriesService,
  getSpecificSubCategoryService,
  updateSubCategoryService,
  deleteSubCategoryService,
} = require("../services/subCategoryService");

exports.setCategoryRoute = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) {
    filterObject = { category: req.params.categoryId };
  }
  req.filterObject = filterObject;
  next();
};

exports.createSubCategory = asyncHandler(async (req, res) => {
  const document = await createSubCategoryService(req.body);
  res.status(201).json({
    message: "✅ Subcategory created successfully",
    data: document,
  });
});

exports.getSubCategories = asyncHandler(async (req, res) => {
  const result = await getSubCategoriesService(req.query, req.filterObject);
  res.status(200).json({
    message: "📥 Subcategories retrieved successfully",
    ...result,
  });
});

exports.getSpecificSubCategory = asyncHandler(async (req, res) => {
  const document = await getSpecificSubCategoryService(req.params.id);
  res.status(200).json({
    message: "🔎 Subcategory retrieved successfully",
    data: document,
  });
});

exports.updateSubCategory = asyncHandler(async (req, res) => {
  const document = await updateSubCategoryService(req.params.id, req.body);
  res.status(200).json({
    message: "🔄 Subcategory updated successfully",
    data: document,
  });
});

exports.deleteSubCategory = asyncHandler(async (req, res) => {
  await deleteSubCategoryService(req.params.id);
  res.status(202).json({
    message: "🗑️ Subcategory deleted successfully",
  });
});
