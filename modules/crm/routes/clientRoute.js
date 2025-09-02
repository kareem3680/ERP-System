const express = require("express");
const router = express.Router();

const clientController = require("../controllers/clientController");
const clientValidator = require("../validators/clientValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(clientController.getClients)
  .post(
    authController.allowedTo("admin", "operation-manager"),
    clientValidator.createClientValidator,
    clientController.createClient
  );

router
  .route("/:id")
  .get(clientValidator.getClientValidator, clientController.getSpecificClient)
  .put(
    authController.allowedTo("admin", "operation-manager"),
    clientValidator.updateClientValidator,
    clientController.updateClient
  )
  .delete(
    authController.allowedTo("admin"),
    clientValidator.deleteClientValidator,
    clientController.deleteClient
  );

module.exports = router;
