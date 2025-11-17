/**
 * 📚 TYPESCRIPT LEARNING: Environment Configuration with Type Safety
 * 
 * This module exports environment variables with:
 * - Type safety (all values have correct types)
 * - Default values
 * - Validation
 * - Helper methods
 * 
 * KEY CONCEPTS:
 * - Strong typing prevents runtime errors
 * - Type assertion (as) tells TypeScript to trust our type
 * - Readonly properties prevent accidental modifications
 */

import { IConfig } from '../types';

/**
 * 💡 LEARNING: Type Guard Function
 * 
 * A function that helps TypeScript narrow down types.
 * Here it ensures NODE_ENV is one of the allowed values.
 */
const validateNodeEnv = (env: string): env is 'development' | 'production' | 'test' => {
  return ['development', 'production', 'test'].includes(env);
};

/**
 * 💡 LEARNING: Helper Function for Parsing Integers
 * 
 * Process.env values are always strings. We need to safely convert them.
 */
const parseIntOrDefault = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * 💡 LEARNING: Configuration Object with Type
 * 
 * By typing this as IConfig, TypeScript ensures:
 * 1. All required properties are present
 * 2. All values have correct types
 * 3. No extra properties are added
 */
const nodeEnv = process.env.NODE_ENV || 'development';
const validatedNodeEnv = validateNodeEnv(nodeEnv) ? nodeEnv : 'development';

const config: IConfig = {
  // Server Configuration
  NODE_ENV: validatedNodeEnv,
  PORT: parseIntOrDefault(process.env.PORT, 3000),
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/loadtest_db',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/loadtest_db_test',
  
  // PostgreSQL Configuration
  PG_HOST: process.env.PG_HOST || 'localhost',
  PG_PORT: parseIntOrDefault(process.env.PG_PORT, 5432),
  PG_DATABASE: process.env.PG_DATABASE || 'loadtest_db',
  PG_USER: process.env.PG_USER || 'postgres',
  PG_PASSWORD: process.env.PG_PASSWORD || '',
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseIntOrDefault(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseIntOrDefault(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
};

/**
 * 💡 LEARNING: Helper Functions as Separate Exports
 * 
 * These provide convenient checks for the environment.
 * TypeScript knows they return boolean values.
 */
export const isProduction = (): boolean => config.NODE_ENV === 'production';
export const isDevelopment = (): boolean => config.NODE_ENV === 'development';
export const isTest = (): boolean => config.NODE_ENV === 'test';

/**
 * 💡 LEARNING: Default Export
 * 
 * This allows: import config from './environment'
 * The config object is read-only (using Object.freeze in runtime)
 */
export default Object.freeze(config);

/**
 * 💡 LEARNING: Named Export Alternative
 * 
 * This allows: import { config } from './environment'
 * Both styles work, but default export is more common for config
 */
export { config };
