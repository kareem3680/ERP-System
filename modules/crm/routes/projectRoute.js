const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");
const projectValidator = require("../validators/projectValidator");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router
  .route("/")
  .get(projectController.getProjects)
  .post(
    authController.allowedTo("admin", "operation-manager"),
    projectValidator.createProjectValidator,
    projectController.createProject
  );

router
  .route("/:id")
  .get(
    projectValidator.getProjectValidator,
    projectController.getSpecificProject
  )
  .put(
    authController.allowedTo("admin", "operation-manager"),
    projectValidator.updateProjectValidator,
    projectController.updateProject
  )
  .delete(
    authController.allowedTo("admin"),
    projectValidator.deleteProjectValidator,
    projectController.deleteProject
  );

module.exports = router;
