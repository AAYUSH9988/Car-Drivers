import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimit.js";

// Routes
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Middleware
import errorHandler from "./middleware/error.js";
import { registerWebRoutes } from "./serverweb.js";

dotenv.config();

// S2 — Enforce JWT secret strength at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET must be at least 32 characters");
  process.exit(1);
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  try {
    let dbConnected = false;
    try {
      const dbConnection = await connectDB();
      dbConnected = !!dbConnection;
    } catch (dbError) {
      console.warn("⚠️  Database connection failed, continuing without DB...");
      dbConnected = false;
    }

    app.locals.dbConnected = dbConnected;

    // S5 — HTTPS redirect in production (Render sets x-forwarded-proto)
    app.use((req, res, next) => {
      if (process.env.NODE_ENV === "production" && req.header("x-forwarded-proto") !== "https") {
        return res.redirect(`https://${req.header("host")}${req.url}`);
      }
      next();
    });

    // Security headers
    app.use(helmet());

    // Gzip compression — reduces response sizes by 3-5x
    app.use(compression());

    // HTTP request logging
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

    // CORS — reads from .env
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5175",
      process.env.ADMIN_URL   || "http://localhost:5174",
    ];
    app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Length", "X-Total-Count"],
      maxAge: 86400
    }));

    // Body parsers — increased limit for base64 image metadata
    app.use(express.json({ limit: "50kb" }));
    app.use(express.urlencoded({ extended: true, limit: "50kb" }));
    app.use(cookieParser({
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }));

    // Strip MongoDB operators from request data (NoSQL injection prevention)
    app.use(mongoSanitize());

    // Global rate limiting
    app.use("/api", apiLimiter);

    // Static files
    app.use("/assets", express.static(path.join(__dirname, "assets")));

    // Root HTML dashboard + /health
    registerWebRoutes(app);

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/drivers", driverRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/payments", paymentRoutes);

    // 404
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
      });
    });

    // Error handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown — finish in-flight requests before exiting
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
