const cron = require("node-cron");
const {
  checkLowStockAndNotify,
} = require("../modules/wms/services/inventoryItemService");

cron.schedule("0 7 * * *", () => {
  console.log("🟢 Running daily low stock check at 7 AM");
  checkLowStockAndNotify();
});
