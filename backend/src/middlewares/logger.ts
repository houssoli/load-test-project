/**
 * 📚 TYPESCRIPT LEARNING: Request Logger Middleware
 * 
 * Logs HTTP requests with timing and status codes.
 * 
 * KEY CONCEPTS:
 * - Middleware function signature
 * - Event listeners for response lifecycle
 * - Type-safe request/response handling
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 💡 LEARNING: Log Entry Interface
 * 
 * Defines the structure of our log object
 * This makes the code self-documenting
 */
interface LogEntry {
  method: string;
  url: string;
  status: number;
  duration: string;
  ip: string | undefined;
  timestamp: string;
}

/**
 * 💡 LEARNING: Request Logger Middleware
 * 
 * Middleware function type:
 * (req: Request, res: Response, next: NextFunction) => void
 * 
 * This logs each HTTP request with:
 * - Method (GET, POST, etc.)
 * - URL path
 * - Response status code
 * - Duration in milliseconds
 * - Client IP address
 * - Timestamp
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  /**
   * 💡 LEARNING: Performance Timing
   * 
   * Date.now() returns current time in milliseconds
   * We use this to calculate request duration
   */
  const start: number = Date.now();

  /**
   * 💡 LEARNING: Response Event Listener
   * 
   * 'finish' event fires when response is complete
   * This ensures we log after the response is sent
   */
  res.on('finish', (): void => {
    const duration: number = Date.now() - start;
    
    /**
     * 💡 LEARNING: Typed Object Creation
     * 
     * TypeScript ensures this matches LogEntry interface
     */
    const log: LogEntry = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      /**
       * 💡 LEARNING: Optional Property Access
       * 
       * req.ip might be undefined, so we use || operator
       * to provide a fallback value
       */
      ip: req.ip || req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    };

    /**
     * 💡 LEARNING: ANSI Color Codes
     * 
     * Terminal color codes for pretty logging:
     * - \x1b[31m = Red
     * - \x1b[33m = Yellow
     * - \x1b[36m = Cyan
     * - \x1b[32m = Green
     * - \x1b[0m  = Reset
     */
    const statusColor: string = 
      res.statusCode >= 500 ? '\x1b[31m' :  // Red for 5xx (server errors)
      res.statusCode >= 400 ? '\x1b[33m' :  // Yellow for 4xx (client errors)
      res.statusCode >= 300 ? '\x1b[36m' :  // Cyan for 3xx (redirects)
      '\x1b[32m';                            // Green for 2xx (success)

    /**
     * 💡 LEARNING: Template Literals
     * 
     * Backticks (`) allow multi-line strings and ${} expressions
     */
    console.log(
      `${statusColor}${log.method}\x1b[0m ${log.url} - ${statusColor}${log.status}\x1b[0m - ${log.duration}`
    );
  });

  /**
   * 💡 LEARNING: next() Function
   * 
   * Calls the next middleware in the chain
   * MUST be called or the request will hang!
   */
  next();
};

/**
 * 💡 LEARNING: Named Export
 * 
 * Allows: import { requestLogger } from './logger'
 */
export default requestLogger;

/**
 * 💡 USAGE EXAMPLE:
 * 
 * import { requestLogger } from './middlewares/logger';
 * app.use(requestLogger);
 * 
 * Output:
 * GET /api/users - 200 - 45ms
 * POST /api/products - 201 - 120ms
 * GET /api/products/123 - 404 - 12ms
 */
