const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const logger = new (require("../../../utils/loggerService"))("product");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const subCategoryModel = require("../models/subCategoryModel");
const brandModel = require("../models/brandModel");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const uploadImages = require("../../../middlewares/uploadImageMiddleware");
const uploadToS3 = require("../../../utils/s3Uploader");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.uploadProductImagesService = uploadImages.uploadMultipleImage();

const uploadImagesToS3 = async (imageData) => {
  const uploaded = {};

  if (imageData?.imageCover) {
    const buffer = await sharp(imageData.imageCover.buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    uploaded.imageCover = await uploadToS3(
      buffer,
      imageData.imageCover.filename,
      "products"
    );
  }

  if (imageData?.images?.length) {
    uploaded.images = [];
    for (let i = 0; i < imageData.images.length; i++) {
      const img = imageData.images[i];
      const buffer = await sharp(img.buffer)
        .resize(1024, 800)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toBuffer();

      const url = await uploadToS3(buffer, img.filename, "products");
      uploaded.images.push(url);
    }
  }

  return uploaded;
};

const validateRelations = async ({ category, subCategories, brand }) => {
  if (category) {
    const exists = await categoryModel.findById(category);
    if (!exists) throw new ApiError(`🛑 Category not found: ${category}`, 400);
  }

  if (subCategories) {
    const subCats =
      typeof subCategories === "string" ? [subCategories] : subCategories;
    const subExists = await subCategoryModel.find({
      _id: { $in: subCats },
      category,
    });
    if (subExists.length !== subCats.length) {
      throw new ApiError(
        `🛑 One or more subcategories are invalid or not belonging to category`,
        400
      );
    }
  }

  if (brand) {
    const exists = await brandModel.findById(brand);
    if (!exists) throw new ApiError(`🛑 Brand not found: ${brand}`, 400);
  }
};

exports.createProductService = asyncHandler(async (body, req) => {
  await validateRelations(body);

  const imageData = {};

  if (req.files?.imageCover?.[0]) {
    imageData.imageCover = {
      filename: `product-${uuidv4()}-${Date.now()}-cover.jpeg`,
      buffer: req.files.imageCover[0].buffer,
    };
  }

  if (req.files?.images?.length) {
    imageData.images = req.files.images.map((img, i) => ({
      filename: `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`,
      buffer: img.buffer,
    }));
  }

  const uploaded = await uploadImagesToS3(imageData);
  if (uploaded.imageCover) body.imageCover = uploaded.imageCover;
  if (uploaded.images) body.images = uploaded.images;

  const product = await createService(productModel, body);

  const populatedProduct = await productModel
    .findById(product._id)
    .populate("category", "name")
    .populate("subCategories", "name")
    .populate("brand", "name");

  await delCache("products:all*");
  await delCache(`product:${product._id}`);

  await logger.info("Product created", { id: product._id });
  return sanitize.sanitizeProduct(populatedProduct);
});

exports.getProductsService = asyncHandler(async (query) => {
  const key = `products:all:${JSON.stringify(query)}`;

  const result = await cacheWrapper(key, async () => {
    const data = await getAllService(
      productModel,
      query,
      "product",
      {},
      {
        populate: [
          { path: "category", select: "name" },
          { path: "subCategories", select: "name" },
          { path: "brand", select: "name" },
        ],
      }
    );

    return {
      ...data,
      data: data.data.map(sanitize.sanitizeProduct),
    };
  });

  await logger.info("Fetched all products");
  return result;
});

exports.getSpecificProductService = asyncHandler(async (id) => {
  const key = `product:${id}`;

  const document = await cacheWrapper(key, async () => {
    const data = await getSpecificService(productModel, id, {
      populate: [
        { path: "category", select: "name" },
        { path: "subCategories", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    return sanitize.sanitizeProduct(data);
  });

  await logger.info("Fetched product", { id });
  return document;
});

exports.updateProductService = asyncHandler(async (id, body, req) => {
  await validateRelations(body);

  const imageData = {};

  if (req.files?.imageCover?.[0]) {
    imageData.imageCover = {
      filename: `product-${uuidv4()}-${Date.now()}-cover.jpeg`,
      buffer: req.files.imageCover[0].buffer,
    };
  }

  if (req.files?.images?.length) {
    imageData.images = req.files.images.map((img, i) => ({
      filename: `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`,
      buffer: img.buffer,
    }));
  }

  const uploaded = await uploadImagesToS3(imageData);
  if (uploaded.imageCover) body.imageCover = uploaded.imageCover;
  if (uploaded.images) body.images = uploaded.images;

  const updated = await updateService(productModel, id, body);

  await delCache("products:all*");
  await delCache(`product:${id}`);

  await logger.info("Product updated", { id });
  return sanitize.sanitizeProduct(updated);
});

exports.deleteProductService = asyncHandler(async (id) => {
  const result = await deleteService(productModel, id);

  await delCache("products:all*");
  await delCache(`product:${id}`);

  await logger.info("Deleted product", { id });
  return result;
});
