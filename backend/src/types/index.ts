/**
 * 📚 TYPESCRIPT LEARNING: Custom Type Definitions
 * 
 * This file contains shared TypeScript interfaces and types used throughout the application.
 * 
 * KEY CONCEPTS:
 * - interface: Defines the shape/structure of an object
 * - type: Can define more complex types (unions, intersections, etc.)
 * - export: Makes types available to other files
 */

import { Document } from 'mongoose';
import { Model } from 'sequelize';

// ========================================
// 🗄️ DATABASE MODEL INTERFACES
// ========================================

/**
 * MongoDB User Document Interface
 * 
 * 💡 LEARNING: We extend Mongoose's Document type to get all MongoDB methods
 * like save(), remove(), etc. while adding our custom fields
 */
export interface IUser extends Document {
  name: string;
  email: string;
  age?: number;                    // ? means optional (can be undefined)
  status: 'active' | 'inactive' | 'pending';  // Union type: must be one of these values
  metadata?: Record<string, any>;  // Record<K, V> = object with string keys and any values
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PostgreSQL Product Model Attributes
 * 
 * 💡 LEARNING: This defines just the data structure, not Sequelize methods
 * Sequelize provides its own typing through Model<T>
 */
export interface IProductAttributes {
  id: string;
  name: string;
  description?: string;            // Optional field
  price: number;
  quantity: number;
  category?: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Complete Product Model with Sequelize methods
 * 
 * 💡 LEARNING: Model<T> adds all Sequelize methods (save, destroy, etc.)
 */
export interface IProduct extends Model<IProductAttributes>, IProductAttributes {}

// ========================================
// 📨 API RESPONSE INTERFACES
// ========================================

/**
 * Standard API Success Response
 * 
 * 💡 LEARNING: Generic type <T> allows us to reuse this interface
 * with different data types. Example:
 * - ApiResponse<IUser[]> for user lists
 * - ApiResponse<IProduct> for single product
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;                        // Optional: present on success
  message?: string;                // Optional: additional info
  error?: string;                  // Optional: present on error
}

/**
 * Paginated Response Interface
 * 
 * 💡 LEARNING: Extends ApiResponse and adds pagination fields
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// 🔍 QUERY & FILTER INTERFACES
// ========================================

/**
 * Pagination Query Parameters
 * 
 * 💡 LEARNING: Used to type Express request query parameters
 */
export interface PaginationQuery {
  page?: string;                   // Query params are always strings
  limit?: string;
  sort?: string;
}

/**
 * User Filter Options
 */
export interface UserFilterOptions extends PaginationQuery {
  status?: 'active' | 'inactive' | 'pending';
  search?: string;
}

/**
 * Product Filter Options
 */
export interface ProductFilterOptions extends PaginationQuery {
  category?: string;
  status?: 'available' | 'out_of_stock' | 'discontinued';
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}

// ========================================
// ⚙️ CONFIGURATION INTERFACES
// ========================================

/**
 * Environment Configuration
 * 
 * 💡 LEARNING: This ensures all config values have proper types
 * and helps catch missing environment variables at compile time
 */
export interface IConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // MongoDB
  MONGODB_URI: string;
  MONGODB_TEST_URI: string;
  
  // PostgreSQL
  PG_HOST: string;
  PG_PORT: number;
  PG_DATABASE: string;
  PG_USER: string;
  PG_PASSWORD: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

// ========================================
// 🛠️ UTILITY TYPES
// ========================================

/**
 * Make all properties optional
 * 
 * 💡 LEARNING: TypeScript utility type - useful for update operations
 * where you only want to update some fields
 */
export type PartialUser = Partial<IUser>;
export type PartialProduct = Partial<IProductAttributes>;

/**
 * Create/Update DTOs (Data Transfer Objects)
 * 
 * 💡 LEARNING: Omit<T, K> removes specified properties from a type
 * Used for create operations where id/timestamps are auto-generated
 */
export type CreateUserDTO = Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | keyof Document>;
export type CreateProductDTO = Omit<IProductAttributes, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update DTOs - all fields optional except id
 * 
 * 💡 LEARNING: Pick<T, K> selects specific properties from a type
 * Combined with Partial for optional updates
 */
export type UpdateUserDTO = Partial<CreateUserDTO>;
export type UpdateProductDTO = Partial<CreateProductDTO>;
