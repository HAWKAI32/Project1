const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error("ERROR STACK:", err.stack);
  console.error("ERROR OBJECT:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    const message = `Resource not found with id of ${err.value}`; // More generic message
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // Extract field name from the error message if possible
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for ${field}. Please use another value.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    // Use the first validation error message for simplicity
    const message = messages[0] || "Validation failed";
    error = new ErrorResponse(message, 400);
  }

  // JWT errors (can add more specific checks if needed)
  if (err.name === "JsonWebTokenError") {
      const message = "Not authorized, token failed";
      error = new ErrorResponse(message, 401);
  }
  if (err.name === "TokenExpiredError") {
      const message = "Not authorized, token expired";
      error = new ErrorResponse(message, 401);
  }

  // Handle specific ErrorResponse instances or default to 500
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    // Optionally include stack trace in development
    // stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};

module.exports = errorHandler;

