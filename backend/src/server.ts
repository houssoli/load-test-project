/**
 * 📚 TYPESCRIPT LEARNING: Server Entry Point
 * 
 * This file starts the Express server and initializes databases.
 * 
 * KEY CONCEPTS:
 * - Async/await for async operations
 * - Process signals for graceful shutdown
 * - Error handling for startup failures
 * - Import statements (ES6 modules)
 */

import dotenv from 'dotenv';
import app from './app';
import config from './config/environment';
import { connectMongoDB, sequelize } from './config/database';

/**
 * 💡 LEARNING: Load Environment Variables
 * 
 * dotenv loads variables from .env file into process.env
 */
dotenv.config();

/**
 * 💡 LEARNING: Type-safe Port
 * 
 * PORT is typed as number from config
 */
const PORT: number = config.PORT;

/**
 * 💡 LEARNING: Async Server Initialization
 * 
 * async function allows us to use await
 * Promise<void> means it returns a Promise with no value
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB connected successfully');

    // Test PostgreSQL connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    /**
     * 💡 LEARNING: Sequelize Sync
     * 
     * Syncs models with database (creates/updates tables)
     * alter: true - updates existing tables without dropping them
     * force: true - drops and recreates (use only in development!)
     */
    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL models synced');

    /**
     * 💡 LEARNING: Starting the HTTP Server
     * 
     * app.listen() starts the server on specified port
     * Callback runs once server is ready
     */
    app.listen(PORT, (): void => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 MongoDB endpoints: http://localhost:${PORT}/api/mongo`);
      console.log(`🔌 PostgreSQL endpoints: http://localhost:${PORT}/api/postgres`);
    });
  } catch (error) {
    /**
     * 💡 LEARNING: Startup Error Handling
     * 
     * If any initialization fails, log error and exit
     */
    console.error('❌ Failed to start server:', error);
    process.exit(1);  // Exit with error code
  }
};

/**
 * 💡 LEARNING: Graceful Shutdown
 * 
 * Handle termination signals (SIGTERM, SIGINT) gracefully
 * Close database connections before exiting
 * 
 * SIGTERM: Termination signal (from docker, kubernetes, etc.)
 * SIGINT: Interrupt signal (Ctrl+C)
 */
process.on('SIGTERM', async (): Promise<void> => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async (): Promise<void> => {
  console.log('SIGINT received, shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

/**
 * 💡 LEARNING: Start the Server
 * 
 * Call the async function to begin initialization
 */
startServer();
