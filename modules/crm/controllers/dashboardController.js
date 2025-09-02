const asyncHandler = require("express-async-handler");

const { getDashboardOverviewService } = require("../services/dashboardService");

exports.getDashboardOverview = asyncHandler(async (req, res) => {
  const overview = await getDashboardOverviewService();

  res.status(200).json({
    message: "✅ Dashboard overview fetched successfully",
    data: overview,
  });
});
