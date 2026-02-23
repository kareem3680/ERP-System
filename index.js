// Import required libraries
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoClean = require("mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const path = require("path");
const compression = require("compression");

// Import files
require("./utils/cronJob");
const dbConnection = require("./config/dataBase");
const Socket = require("./config/socket");
const { connectRedis } = require("./config/redisClient");
const globalError = require("./middlewares/errorMiddleware");
const ApiError = require("./utils/apiError");
const sanitizeInput = require("./utils/sanitizeApp");
const controller = require("./modules/e-commerce/controllers/orderController");
const mountRoutesIdentity = require("./modules/identity/routes");
const mountRoutesECommerce = require("./modules/e-commerce/routes");
const mountRoutesWms = require("./modules/wms/routes");
const mountRoutesTransaction = require("./modules/transactions/routes");
const mountRoutesNotifications = require("./modules/notifications/routes");
const mountRoutesCrm = require("./modules/crm/routes");

// Application
dotenv.config({ path: "config.env" });
const app = express();

// WebHook
app.post(
  "/stripe-webhook-checkout",
  express.raw({ type: "application/json" }),
  controller.stripeWebhookCheckout,
);

// Middlewares
app.use(express.json({ limit: "350kb" }));
app.set("trust proxy", 1);
app.use(cors());

// Security Middlewares
app.use(helmet());

app.use((req, res, next) => {
  req.body = mongoClean(req.body);
  req.params = mongoClean(req.params);
  req.cleanedQuery = mongoClean(req.query);
  next();
});

app.use(hpp());
app.use(compression());
app.use(express.static(path.join(__dirname, "uploads")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "🛑 Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use((req, res, next) => {
  req.body = sanitizeInput(req.body);
  req.params = sanitizeInput(req.params);
  req.cleanedQuery = sanitizeInput(req.query);
  next();
});

// Logging in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
mountRoutesIdentity(app);
mountRoutesECommerce(app);
mountRoutesWms(app);
mountRoutesTransaction(app);
mountRoutesNotifications(app);
mountRoutesCrm(app);

// Handle unmatched routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to ERP Back-End API",
  });
});

// Handle Errors In Express
app.use(globalError);

// 🔥 Important: Initialize connections before exporting (Vercel Serverless)
let isInitialized = false;

const initApp = async () => {
  if (isInitialized) return;
  try {
    await dbConnection();
    await connectRedis();
    isInitialized = true;
    console.log("🚀 App initialized with DB & Redis");
  } catch (err) {
    console.error("🔴 Initialization failed:", err);
    throw err;
  }
};

// Initialize once
initApp();

// Optional: If running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, () => {
    console.log(
      `🟢 Mode Is: ${process.env.NODE_ENV}\n🟢 Server is running on port: ${PORT}`,
    );
  });

  Socket.initSocket(server);
}

// Export app for Vercel
module.exports = app;
