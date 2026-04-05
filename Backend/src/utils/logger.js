const morgan = require("morgan");

// Custom format for production logs
const prodFormat =
  ":remote-addr - :method :url :status :res[content-length] - :response-time ms";

// Logger configuration
const logger = morgan(
  process.env.NODE_ENV === "development" ? "dev" : prodFormat,
  {
    skip: (req, res) =>
      process.env.NODE_ENV === "production" && res.statusCode < 400,
    // In production, skip successful requests (only log errors)
  },
);

module.exports = logger;
