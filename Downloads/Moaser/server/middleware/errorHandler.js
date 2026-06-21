function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode
    });
  }

  // Default 500 error
  res.status(500).json({
    error: "Internal server error",
    status: 500
  });
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, AppError };
