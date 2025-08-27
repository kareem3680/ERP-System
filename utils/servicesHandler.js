const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.deleteService = asyncHandler(async (model, id) => {
  const document = await model.findByIdAndDelete(id);
  if (!document) {
    throw new ApiError(`🛑 No document for this ID: ${id}`, 404);
  }
  return;
});

exports.updateService = asyncHandler(async (model, id, body) => {
  const { password, role, ...rest } = body;
  const document = await model.findById(id);
  if (!document) {
    throw new ApiError(`🛑 No document for this ID: ${id}`, 404);
  }
  Object.assign(document, rest);
  await document.save();
  return document;
});

exports.createService = asyncHandler(async (model, body) => {
  const newDocument = await model.create(body);
  return newDocument;
});

exports.getAllService = asyncHandler(
  async (model, query, modelName, filter = {}, options = {}) => {
    const documentsCount = await model.countDocuments();

    const apiFeatures = new ApiFeatures(model.find(filter), query)
      .filter()
      .limit()
      .paginate(documentsCount)
      .sort()
      .search(modelName);

    if (options.populate) {
      apiFeatures.mongooseQuery = apiFeatures.mongooseQuery.populate(
        options.populate
      );
    }

    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    return {
      results: documents.length,
      data: documents,
      paginationResult,
    };
  }
);

exports.getSpecificService = asyncHandler(async (model, id, options = {}) => {
  let query = model.findById(id);

  if (options.populate) {
    query = query.populate(options.populate);
  }

  if (options.select) {
    query = query.select(options.select);
  }

  const document = await query;
  if (!document) {
    throw new ApiError(`🛑 No document for this ID: ${id}`, 404);
  }

  return document;
});
