/**
 * 📚 TYPESCRIPT LEARNING: Error Handler Middleware
 * 
 * Express error handling middleware with type safety.
 * 
 * KEY CONCEPTS:
 * - Error middleware has 4 parameters (err, req, res, next)
 * - Type guards help identify different error types
 * - Proper typing prevents runtime errors
 */

import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ValidationError, UniqueConstraintError } from 'sequelize';
import { isDevelopment } from '../config/environment';

/**
 * 💡 LEARNING: Custom Error Interface
 * 
 * Extends the base Error type to include optional properties
 * that different error types might have
 */
interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyPattern?: Record<string, number>;
  errors?: any[];
}

/**
 * 💡 LEARNING: Error Handler Function Type
 * 
 * (err, req, res, next) => void
 * Express recognizes this as error handling middleware
 * 
 * IMPORTANT: Must have 4 parameters even if 'next' is unused
 */
export const errorHandler = (
  err: CustomError,
  _req: Request,      // Prefix with _ to indicate intentionally unused
  res: Response,
  _next: NextFunction // Prefix with _ to indicate intentionally unused
): void => {
  console.error('Error:', err);

  /**
   * 💡 LEARNING: Type Guards for Error Handling
   * 
   * We check the error 'name' or 'code' to determine
   * what type of error it is and handle accordingly
   */

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    /**
     * 💡 LEARNING: Type Casting
     * 
     * We know this is a Mongoose ValidationError,
     * so we cast it to access Mongoose-specific properties
     */
    const mongooseErr = err as unknown as MongooseError.ValidationError;
    const errors = Object.values(mongooseErr.errors).map(e => e.message);
    
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
    return; // Explicit return in strict mode
  }

  // Mongoose cast error (invalid ID format)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    /**
     * 💡 LEARNING: Optional Chaining (?.)
     * 
     * Safely access nested properties that might not exist
     * Returns undefined if any part is null/undefined
     */
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    
    res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const sequelizeErr = err as unknown as ValidationError;
    const errors = sequelizeErr.errors.map(e => e.message);
    
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
    return;
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const sequelizeErr = err as unknown as UniqueConstraintError;
    
    res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: sequelizeErr.errors[0]?.path,
    });
    return;
  }

  // JWT errors (if you add authentication later)
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  /**
   * 💡 LEARNING: Default Error Response
   * 
   * Fallback for unhandled errors
   * In development: include stack trace
   * In production: hide sensitive details
   */
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    /**
     * 💡 LEARNING: Conditional Spread Operator
     * 
     * ...(condition && { key: value })
     * Only includes the property if condition is true
     */
    ...(isDevelopment() && { stack: err.stack }),
  });
};

/**
 * 💡 LEARNING: Named Export
 * 
 * Allows: import { errorHandler } from './errorHandler'
 */
export default errorHandler;
