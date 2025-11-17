/**
 * 📚 TYPESCRIPT LEARNING: Express Application Setup
 * 
 * This is the main Express application configuration.
 * 
 * KEY CONCEPTS:
 * - Express app initialization
 * - Middleware registration
 * - Route mounting
 * - Type-safe configuration
 */

import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import config from './config/environment';
import mongoRoutes from './routes/mongoRoutes';
import postgresRoutes from './routes/postgresRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/logger';

/**
 * 💡 LEARNING: Application Type
 * 
 * Application is the type for Express app
 */
const app: Application = express();

/**
 * 💡 LEARNING: Security Middleware
 * 
 * helmet() sets various HTTP headers for security
 */
app.use(helmet());

/**
 * 💡 LEARNING: CORS (Cross-Origin Resource Sharing)
 * 
 * Allows requests from different origins/domains
 */
app.use(cors());

/**
 * 💡 LEARNING: Compression Middleware
 * 
 * Compresses response bodies for better performance
 */
app.use(compression());

/**
 * 💡 LEARNING: Body Parsing Middleware
 * 
 * Parses incoming request bodies (JSON and URL-encoded)
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * 💡 LEARNING: Custom Middleware
 * 
 * Request logging for monitoring
 */
app.use(requestLogger);

/**
 * 💡 LEARNING: Rate Limiting
 * 
 * Prevents abuse by limiting requests per IP
 */
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

/**
 * 💡 LEARNING: Health Check Endpoint
 * 
 * Simple endpoint to verify server is running
 */
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * 💡 LEARNING: Mounting Routers
 * 
 * app.use() mounts routers at specific paths
 * All routes in mongoRoutes will be under /api/mongo
 */
app.use('/api/mongo', mongoRoutes);
app.use('/api/postgres', postgresRoutes);

/**
 * 💡 LEARNING: 404 Handler
 * 
 * Catches requests to undefined routes
 */
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * 💡 LEARNING: Error Handling Middleware
 * 
 * Must be last! Catches all errors from other middleware/routes
 */
app.use(errorHandler);

/**
 * 💡 LEARNING: Export App
 * 
 * Export for use in server.ts
 */
export default app;
