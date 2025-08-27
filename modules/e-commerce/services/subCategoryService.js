const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("subCategory");
const subCategoryModel = require("../models/subCategoryModel");
const categoryModel = require("../models/categoryModel");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createSubCategoryService = asyncHandler(async (body) => {
  const categoryExists = await categoryModel.findById(body.category);
  if (!categoryExists) {
    await logger.error("SubCategory creation failed - category not found", {
      categoryId: body.category,
    });
    throw new ApiError(`🛑 No category found for ID: ${body.category}`, 404);
  }

  const nameExists = await subCategoryModel.findOne({
    name: body.name,
    category: body.category,
  });
  if (nameExists) {
    await logger.error("SubCategory creation failed - name already exists", {
      name: body.name,
      category: body.category,
    });
    throw new ApiError(
      `🛑 SubCategory name already exists in this category`,
      400
    );
  }

  let document = await createService(subCategoryModel, body);
  document = await document.populate({ path: "category" });

  await logger.info("SubCategory created", { id: document._id });
  return sanitize.sanitizeSubCategory(document);
});

exports.getSubCategoriesService = asyncHandler(
  async (query, filterObject = {}) => {
    const result = await getAllService(
      subCategoryModel,
      query,
      "subCategory",
      filterObject,
      { populate: { path: "category" } }
    );

    await logger.info("Fetched all subcategories");

    return {
      ...result,
      data: result.data.map(sanitize.sanitizeSubCategory),
    };
  }
);

exports.getSpecificSubCategoryService = asyncHandler(async (id) => {
  const document = await getSpecificService(subCategoryModel, id, {
    populate: { path: "category", select: "name" },
  });

  await logger.info("Fetched subcategory", { id });
  return sanitize.sanitizeSubCategory(document);
});

exports.updateSubCategoryService = asyncHandler(async (id, body) => {
  const subCategory = await subCategoryModel.findById(id);
  if (!subCategory) {
    await logger.error("SubCategory to update not found", { id });
    throw new ApiError(`🛑 No subcategory found for ID: ${id}`, 404);
  }

  if (body.category) {
    const categoryExists = await categoryModel.findById(body.category);
    if (!categoryExists) {
      await logger.error("SubCategory update failed - category not found", {
        categoryId: body.category,
      });
      throw new ApiError(`🛑 No category found for ID: ${body.category}`, 404);
    }
  }

  if (body.name) {
    const nameExists = await subCategoryModel.findOne({
      name: body.name,
      category: body.category || subCategory.category,
      _id: { $ne: id },
    });

    if (nameExists) {
      await logger.error("SubCategory update failed - name already exists", {
        name: body.name,
      });
      throw new ApiError(
        `🛑 SubCategory name already exists in this category`,
        400
      );
    }
  }

  const updated = await updateService(subCategoryModel, id, body);
  const populated = await subCategoryModel
    .findById(updated._id)
    .populate("category");

  await logger.info("Updated subcategory", { id });
  return sanitize.sanitizeSubCategory(populated);
});

exports.deleteSubCategoryService = asyncHandler(async (id) => {
  const result = await deleteService(subCategoryModel, id);
  await logger.info("Deleted subcategory", { id });
  return result;
});
