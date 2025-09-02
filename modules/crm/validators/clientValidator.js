const { check } = require("express-validator");

const validatorMiddleware = require("../../../middlewares/validatorMiddleware");

exports.createClientValidator = [
  check("name").notEmpty().withMessage("Client name is required"),
  check("email")
    .notEmpty()
    .withMessage("Client email is required")
    .isEmail()
    .withMessage("Invalid email"),
  check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  check("company").optional().isString(),
  check("address").optional().isString(),
  check("notes").optional().isString(),
  check("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID for assignedTo"),
  validatorMiddleware,
];

exports.getClientValidator = [
  check("id").isMongoId().withMessage("Invalid client ID"),
  validatorMiddleware,
];

exports.updateClientValidator = [
  check("id").isMongoId().withMessage("Invalid client ID"),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Client name cannot be empty"),
  check("email").optional().isEmail().withMessage("Invalid email"),
  check("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
  check("company").optional().isString(),
  check("address").optional().isString(),
  check("notes").optional().isString(),
  check("assignedTo")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID for assignedTo"),
  validatorMiddleware,
];

exports.deleteClientValidator = [
  check("id").isMongoId().withMessage("Invalid client ID"),
  validatorMiddleware,
];
