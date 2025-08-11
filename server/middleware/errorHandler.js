const logger = require('../utils/logger');


const createErrorResponse = (message, statusCode, details = null) => {
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString(),
    statusCode: statusCode
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  return response;
};


const errorHandler = (err, req, res, next) => {
  // Log the error
  // logger.error('Error occurred:', {
  //   error: err.message,
  //   stack: err.stack,
  //   url: req.originalUrl,
  //   method: req.method,
  //   ip: req.ip,
  //   userAgent: req.get('User-Agent')
  // });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(createErrorResponse(
      'Validation failed',
      400,
      validationErrors
    ));
  }

  if (err.name === 'CastError') {
    return res.status(400).json(createErrorResponse(
      'Invalid ID format',
      400
    ));
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json(createErrorResponse(
      `${field} already exists`,
      409
    ));
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(createErrorResponse(
      'Invalid token',
      401
    ));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(createErrorResponse(
      'Token expired',
      401
    ));
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json(createErrorResponse(
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  ));
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  createErrorResponse
}; 