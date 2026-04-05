// -------------------- Imports --------------------
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const errorMiddleware = require("./middleware/errorMiddleware");

// Route modules
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const listingRoutes = require("./routes/listingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// -------------------- Middleware --------------------
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(logger); // Custom request logger
app.disable("etag"); // Disable caching headers for fresh responses

// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.status(200).send("🌍 Wanderlust backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// -------------------- Health Check --------------------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy 🚀" });
});

// -------------------- Error Handler --------------------
app.use(errorMiddleware);

module.exports = app;
