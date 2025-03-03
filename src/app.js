import express from "express";
import knex from "knex";
import cors from "cors";
import helmet from "helmet";
import config from "./config/knexConfig.js";
import roleRoutes from "./routes/v1/roleRoutes.js";
import permissionRoutes from "./routes/v1/permissionRoutes.js";
import { responseHandler } from "./middleware/response/responseHandler.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error/errorHandler.js";
import i18nextMiddleware from "./config/i18nConfig.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware);

// Response Handler Middleware (before routes)
app.use(responseHandler);

// Initialize knex with configuration for current environment
const environment = process.env.NODE_ENV || "development";
const db = knex(config[environment]);

// Make the DB connection available to routes via app.locals
app.locals.db = db;

// Health check endpoint
app.get("/health", (req, res) => {
  res.success(
    {
      uptime: process.uptime(),
      timestamp: new Date(),
      environment,
    },
    "Service is healthy"
  );
});

// API Routes
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);

// 404 Handler (after routes)
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await db.destroy();
  process.exit(0);
});

export default app;
