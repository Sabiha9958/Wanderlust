// -------------------- Imports --------------------
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const errorMiddleware = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

/* -------------------- Core Middleware -------------------- */

// CORS (restrict in production)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

// Body parsers (limit added for security)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Logger
app.use(logger);

// Disable ETag (optional)
app.disable("etag");

/* -------------------- Routes -------------------- */

// Root
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌍 Wanderlust API running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
  });
});

/* -------------------- 404 Handler -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* -------------------- Global Error Handler -------------------- */
app.use(errorMiddleware);

module.exports = app;
