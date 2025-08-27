const asyncHandler = require("express-async-handler");

const {
  createUserService,
  getUsersService,
  getSpecificUserService,
  updateUserRoleService,
  deleteUserService,
} = require("../services/adminService");

exports.createUser = asyncHandler(async (req, res) => {
  const data = await createUserService(req.body);
  res.status(201).json({
    message: "✅ User created successfully",
    data,
  });
});

exports.getUsers = asyncHandler(async (req, res) => {
  const response = await getUsersService(req);
  res.status(200).json({
    message: "✅ Users fetched successfully",
    ...response,
  });
});

exports.getSpecificUser = asyncHandler(async (req, res) => {
  const data = await getSpecificUserService(req.params.id);
  res.status(200).json({
    message: "✅ User retrieved successfully",
    data,
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await updateUserRoleService(id, req.body.role);
  res.status(200).json({
    message: "🔄 User role updated successfully",
    data,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await deleteUserService(req.params.id);
  res.status(202).json({
    message: "🗑️ User deleted successfully",
  });
});
