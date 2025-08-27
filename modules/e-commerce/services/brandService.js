const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");

const logger = new (require("../../../utils/loggerService"))("brand");
const uploadImage = require("../../../middlewares/uploadImageMiddleware");
const brandModel = require("../models/brandModel");
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

exports.uploadBrandImageService = uploadImage.uploadSingleImage("image");

exports.resizeAndUploadBrandImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    const s3Url = await uploadToS3(buffer, filename, "brands");

    req.body.image = s3Url;
  }
  next();
});

exports.createBrandService = asyncHandler(async (body) => {
  const existing = await brandModel.findOne({ name: body.name });
  if (existing) {
    await logger.error("Brand creation failed - name already exists", {
      name: body.name,
    });
    throw new ApiError(`🛑 Brand name already exists`, 400);
  }

  const brand = await createService(brandModel, body);

  await logger.info("Brand created", { id: brand._id });
  return sanitize.sanitizeBrand(brand);
});

exports.getBrandsService = asyncHandler(async (query) => {
  const result = await getAllService(brandModel, query, "brand");
  await logger.info("Fetched all brands");
  return {
    ...result,
    data: result.data.map(sanitize.sanitizeBrand),
  };
});

exports.getSpecificBrandService = asyncHandler(async (id) => {
  const brand = await getSpecificService(brandModel, id);
  if (!brand) {
    await logger.error("Brand not found", { id });
    throw new ApiError(`🛑 No brand found for ID: ${id}`, 404);
  }

  await logger.info("Fetched brand", { id });
  return sanitize.sanitizeBrand(brand);
});

exports.updateBrandService = asyncHandler(async (id, body) => {
  const brand = await brandModel.findById(id);
  if (!brand) {
    await logger.error("Brand to update not found", { id });
    throw new ApiError(`🛑 No brand found for ID: ${id}`, 404);
  }

  if (body.name && body.name !== brand.name) {
    const nameExists = await brandModel.findOne({
      name: body.name,
      _id: { $ne: id },
    });
    if (nameExists) {
      await logger.error("Brand update failed - name already exists", {
        name: body.name,
      });
      throw new ApiError(`🛑 Brand name already exists`, 400);
    }
  }

  const updated = await updateService(brandModel, id, body);

  await logger.info("Brand updated", { id });
  return sanitize.sanitizeBrand(updated);
});

exports.deleteBrandService = asyncHandler(async (id) => {
  const result = await deleteService(brandModel, id);
  await logger.info("Brand deleted", { id });
  return result;
});
