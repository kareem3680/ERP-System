const asyncHandler = require("express-async-handler");

const {
  createClientService,
  getClientsService,
  getSpecificClientService,
  updateClientService,
  deleteClientService,
} = require("../services/clientService");

exports.createClient = asyncHandler(async (req, res) => {
  const client = await createClientService(req.body);
  res.status(201).json({
    message: "✅ Client created successfully",
    data: client,
  });
});

exports.getClients = asyncHandler(async (req, res) => {
  const clients = await getClientsService(req.query);
  res.status(200).json({
    message: "✅ Clients fetched successfully",
    ...clients,
  });
});

exports.getSpecificClient = asyncHandler(async (req, res) => {
  const client = await getSpecificClientService(req.params.id);
  res.status(200).json({
    message: "✅ Client fetched successfully",
    data: client,
  });
});

exports.updateClient = asyncHandler(async (req, res) => {
  const updated = await updateClientService(req.params.id, req.body);
  res.status(200).json({
    message: "✅ Client updated successfully",
    data: updated,
  });
});

exports.deleteClient = asyncHandler(async (req, res) => {
  const result = await deleteClientService(req.params.id);
  res.status(200).json({
    message: "🗑️ Client deleted successfully",
    ...result,
  });
});
