const asyncHandler = require("express-async-handler");

const logger = new (require("../../../utils/loggerService"))("admin");
const userModel = require("../models/userModel");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");
const {
  createService,
  getAllService,
  getSpecificService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createUserService = asyncHandler(async (body) => {
  const { role, ...rest } = body;

  const existingUser = await userModel.findOne({ email: rest.email });

  if (existingUser) {
    await logger.error("User creation failed - email already exists", {
      email: rest.email,
    });
    throw new ApiError("🛑 Email already exists", 400);
  }

  const newUser = await createService(userModel, rest);
  await logger.info("User created", { userId: newUser._id });

  return sanitize.sanitizeUser(newUser);
});

exports.getUsersService = asyncHandler(async (req) => {
  const result = await getAllService(userModel, req.query, "user");

  await logger.info("Fetched all users");

  return {
    results: result.results,
    message: "Users retrieved successfully",
    data: result.data.map(sanitize.sanitizeUser),
    paginationResult: result.paginationResult,
  };
});

exports.getSpecificUserService = asyncHandler(async (id) => {
  const user = await getSpecificService(userModel, id);
  await logger.info("Fetched user", { id });
  return sanitize.sanitizeUser(user);
});

exports.updateUserRoleService = asyncHandler(async (id, role, body = {}) => {
  if (!role) {
    await logger.error("Role is missing", { id });
    throw new ApiError("🛑 Role is required to update the user", 400);
  }

  const user = await userModel.findById(id);
  if (!user) {
    await logger.error("User to update not found", { id });
    throw new ApiError(`🛑 Cannot update. No user found with ID: ${id}`, 404);
  }

  if (body.email) {
    const existingEmail = await userModel.findOne({ email: body.email });
    if (existingEmail && existingEmail._id.toString() !== user._id.toString()) {
      await logger.error("Email already in use", { email: body.email });
      throw new ApiError("🛑 E-Mail already exists", 400);
    }
    user.email = body.email;
  }

  if (body.name) {
    user.name = body.name;
    user.slug = slugify(body.name);
  }

  user.role = role;
  await user.save();

  await logger.info("User role updated", { id, role });
  return sanitize.sanitizeUser(user);
});

exports.deleteUserService = asyncHandler(async (id) => {
  const user = await deleteService(userModel, id);
  await logger.info("User deleted", { id });
  return user;
});
