const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authController = require("../../identity/controllers/authController");

router.use(authController.protect);

router.get("/overview", dashboardController.getDashboardOverview);

module.exports = router;
