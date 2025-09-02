const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const taskValidator = require("../validators/taskValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(taskController.getTasks)
  .post(
    authController.allowedTo("admin", "operation-manager"),
    taskValidator.createTaskValidator,
    taskController.createTask
  );

router
  .route("/:id")
  .get(taskValidator.getTaskValidator, taskController.getSpecificTask)
  .put(
    authController.allowedTo("admin", "operation-manager"),
    taskValidator.updateTaskValidator,
    taskController.updateTask
  )
  .delete(
    authController.allowedTo("admin", "operation-manager"),
    taskValidator.deleteTaskValidator,
    taskController.deleteTask
  );

module.exports = router;
