const errorMiddleware = (err, req, res, next) => {
  console.error("❌ Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(statusCode).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Duplicate key errors (e.g., unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(", ");
    message = `Duplicate field value for: ${field}. Please use another value.`;
  }

  // Invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Malformed token. Please provide a valid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  // Default error response
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
