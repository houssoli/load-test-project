/**
 * 📚 TYPESCRIPT LEARNING: Database Configuration Module
 * 
 * This module sets up connections to MongoDB and PostgreSQL.
 * 
 * KEY CONCEPTS:
 * - Import statements (ES6 modules instead of require)
 * - Async/await with proper error typing
 * - Export named functions and objects
 * - Type annotations for better IDE support
 */

import mongoose from 'mongoose';
import { Sequelize, Options } from 'sequelize';
import config, { isTest, isDevelopment } from './environment';

/**
 * 💡 LEARNING: Async Function with Return Type
 * 
 * Promise<void> means this function:
 * - Is asynchronous (returns a Promise)
 * - Doesn't return a value (void)
 * - Can throw errors
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    // Determine which MongoDB URI to use based on environment
    const mongoURI: string = isTest() 
      ? config.MONGODB_TEST_URI 
      : config.MONGODB_URI;

    /**
     * 💡 LEARNING: Mongoose with TypeScript
     * 
     * Mongoose 6+ handles these options automatically,
     * so we don't need to pass them explicitly anymore
     */
    await mongoose.connect(mongoURI);

    /**
     * 💡 LEARNING: Event Listeners with Typed Parameters
     * 
     * The (err: Error) syntax tells TypeScript what type the error will be
     */
    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    /**
     * 💡 LEARNING: Error Handling in TypeScript
     * 
     * In strict mode, caught errors are 'unknown' type (not 'any')
     * We need to check/assert the type before using it
     */
    if (error instanceof Error) {
      console.error('MongoDB connection failed:', error.message);
    } else {
      console.error('MongoDB connection failed:', error);
    }
    throw error;
  }
};

/**
 * 💡 LEARNING: Sequelize Configuration with Types
 * 
 * The Options type ensures all configuration is valid
 */
const sequelizeOptions: Options = {
  host: config.PG_HOST,
  port: config.PG_PORT,
  dialect: 'postgres',                    // PostgreSQL dialect
  
  /**
   * 💡 LEARNING: Conditional Logging
   * 
   * Type: false | Function
   * - false disables logging
   * - console.log enables SQL query logging
   */
  logging: isDevelopment() ? console.log : false,
  
  /**
   * 💡 LEARNING: Connection Pool Configuration
   * 
   * Pool reuses database connections for better performance
   */
  pool: {
    max: 10,        // Maximum number of connections
    min: 0,         // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to acquire connection
    idle: 10000,    // Maximum time (ms) connection can be idle
  },
  
  /**
   * 💡 LEARNING: Default Model Options
   * 
   * These settings apply to all Sequelize models
   */
  define: {
    timestamps: true,     // Automatically add createdAt/updatedAt
    underscored: true,    // Use snake_case for column names
  },
};

/**
 * 💡 LEARNING: Creating a Sequelize Instance
 * 
 * Type: Sequelize - TypeScript knows all available methods
 */
export const sequelize = new Sequelize(
  config.PG_DATABASE,
  config.PG_USER,
  config.PG_PASSWORD,
  sequelizeOptions
);

/**
 * 💡 LEARNING: Re-exporting Mongoose
 * 
 * This allows other files to import mongoose from this module
 * Example: import { mongoose } from './database'
 */
export { mongoose };

/**
 * 💡 LEARNING: Default Export (Optional)
 * 
 * Allows: import db from './database'
 * Then: db.connectMongoDB(), db.sequelize, etc.
 */
export default {
  connectMongoDB,
  sequelize,
  mongoose,
};
