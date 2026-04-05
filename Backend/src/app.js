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

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.disable("etag"); // disable caching headers

// -------------------- Routes --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

// -------------------- Health Check --------------------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// -------------------- Error Handler --------------------
app.use(errorMiddleware);

module.exports = app;
