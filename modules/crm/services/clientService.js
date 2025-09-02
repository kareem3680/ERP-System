const asyncHandler = require("express-async-handler");

const clientModel = require("../models/clientModel");
const userModel = require("../../identity/models/userModel");
const sanitize = require("../../../utils/sanitizeData");
const logger = new (require("../../../utils/loggerService"))("client");
const ApiError = require("../../../utils/apiError");
const { cacheWrapper, delCache } = require("../../../utils/cache");
const {
  createAndSendNotificationService,
} = require("../../notifications/services/notificationService");
const {
  createService,
  getAllService,
  getSpecificService,
  updateService,
  deleteService,
} = require("../../../utils/servicesHandler");

exports.createClientService = asyncHandler(async (body) => {
  const { email, assignedTo } = body;

  const existingClient = await clientModel.findOne({ email });
  if (existingClient) {
    throw new ApiError("🛑 Email already exists for another client", 400);
  }

  let assignedUser = null;
  if (assignedTo) {
    assignedUser = await userModel.findById(assignedTo);
    if (!assignedUser) {
      throw new ApiError("🛑 Assigned user not found", 404);
    }
  }

  const client = await createService(clientModel, body);
  await delCache("clients:all*");
  await delCache(`client:${client._id}`);

  await logger.info("Client created", { id: client._id });

  if (assignedUser) {
    await createAndSendNotificationService({
      title: `New Client Assigned: ${client.name}`,
      message: `You have been assigned to client "${client.name}"`,
      module: "system",
      importance: "high",
      from: "system",
      to: assignedUser._id,
    });
  }

  return sanitize.sanitizeClient(client);
});

exports.getClientsService = asyncHandler(async (query) => {
  return cacheWrapper(
    "clients:all",
    async () => {
      const result = await getAllService(
        clientModel,
        query,
        "client",
        {},
        {
          populate: [{ path: "assignedTo", select: "name email" }],
        }
      );

      await logger.info("Fetched all clients");

      return {
        ...result,
        data: result.data.map(sanitize.sanitizeClient),
      };
    },
    60
  );
});

exports.getSpecificClientService = asyncHandler(async (id) => {
  return cacheWrapper(
    `client:${id}`,
    async () => {
      const client = await getSpecificService(clientModel, id, {
        populate: [{ path: "assignedTo", select: "name email" }],
      });

      if (!client) throw new ApiError("🛑 Client not found", 404);

      await logger.info("Fetched client", { id });
      return sanitize.sanitizeClient(client);
    },
    60
  );
});

exports.updateClientService = asyncHandler(async (id, body) => {
  const { email, assignedTo } = body;

  const client = await clientModel.findById(id);
  if (!client) {
    throw new ApiError("🛑 Client not found", 404);
  }

  if (email) {
    const existingClient = await clientModel.findOne({ email });
    if (existingClient) {
      if (existingClient._id.toString() === client._id.toString()) {
        throw new ApiError("🛑 This is your current email", 200);
      } else {
        throw new ApiError("🛑 Email already exists for another client", 400);
      }
    }
  }

  let newAssignedUser = null;
  if (assignedTo) {
    newAssignedUser = await userModel.findById(assignedTo);

    if (!newAssignedUser) {
      throw new ApiError("🛑 Assigned user not found", 404);
    }

    if (
      client.assignedTo &&
      assignedTo.toString() === client.assignedTo.toString()
    ) {
      throw new ApiError("🛑 Already assigned to this user", 200);
    }
  }

  const updatedClient = await updateService(clientModel, id, body);

  await delCache("clients:all*");
  await delCache(`client:${id}`);

  await logger.info("Client updated", { id });

  if (newAssignedUser) {
    await createAndSendNotificationService({
      title: `New Client Assigned: ${updatedClient.name}`,
      message: `You have been assigned to client "${updatedClient.name}"`,
      module: "system",
      importance: "high",
      from: "system",
      to: newAssignedUser._id,
    });
  }

  return sanitize.sanitizeClient(updatedClient);
});

exports.deleteClientService = asyncHandler(async (id) => {
  const result = await deleteService(clientModel, id);

  await delCache("clients:all*");
  await delCache(`client:${id}`);

  await logger.info("Client deleted", { id });
  return result;
});
