const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const logger = new (require("../../../utils/loggerService"))("category");
const uploadImage = require("../../../middlewares/uploadImageMiddleware");
const categoryModel = require("../models/categoryModel");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const uploadToS3 = require("../../../utils/s3Uploader");
const {
  createService,
  deleteService,
  updateService,
  getAllService,
  getSpecificService,
} = require("../../../utils/servicesHandler");

exports.uploadCategoryImageService = uploadImage.uploadSingleImage("image");

exports.resizeAndUploadCategoryImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    const s3Url = await uploadToS3(buffer, filename, "categories");

    req.body.image = s3Url;
  }
  next();
});

exports.createCategoryService = asyncHandler(async (body) => {
  const existing = await categoryModel.findOne({ name: body.name });
  if (existing) {
    await logger.error("Category creation failed - name already exists", {
      name: body.name,
    });
    throw new ApiError("🛑 Category name already exists", 400);
  }

  const category = await createService(categoryModel, body);

  await logger.info("Category created", { id: category._id });
  return sanitize.sanitizeCategory(category);
});

exports.getCategoriesService = asyncHandler(async (query) => {
  const result = await getAllService(categoryModel, query, "category");
  await logger.info("Fetched all categories");
  return {
    ...result,
    data: result.data.map(sanitize.sanitizeCategory),
  };
});

exports.getSpecificCategoryService = asyncHandler(async (id) => {
  const category = await getSpecificService(categoryModel, id);
  if (!category) {
    await logger.error("Category not found", { id });
    throw new ApiError(`🛑 No category found for ID: ${id}`, 404);
  }

  await logger.info("Fetched category", { id });
  return sanitize.sanitizeCategory(category);
});

exports.updateCategoryService = asyncHandler(async (id, body) => {
  const category = await categoryModel.findById(id);
  if (!category) {
    await logger.error("Category to update not found", { id });
    throw new ApiError(`🛑 No category found for ID: ${id}`, 404);
  }

  if (body.name && body.name !== category.name) {
    const nameExists = await categoryModel.findOne({
      name: body.name,
      _id: { $ne: id },
    });
    if (nameExists) {
      await logger.error("Category update failed - name already exists", {
        name: body.name,
      });
      throw new ApiError("🛑 Category name already exists", 400);
    }
  }

  const updated = await updateService(categoryModel, id, body);

  await logger.info("Category updated", { id });
  return sanitize.sanitizeCategory(updated);
});

exports.deleteCategoryService = asyncHandler(async (id) => {
  const result = await deleteService(categoryModel, id);
  await logger.info("Category deleted", { id });
  return result;
});
