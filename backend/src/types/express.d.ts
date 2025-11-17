/**
 * 📚 TYPESCRIPT LEARNING: Express Type Extensions
 * 
 * This file extends Express's default types to add custom properties.
 * 
 * KEY CONCEPTS:
 * - declare global: Modifies global type definitions
 * - namespace: Groups related types together
 * - interface merging: TypeScript allows extending existing interfaces
 */

import { Request, Response } from 'express';
import { ApiResponse, PaginatedResponse } from './index';

/**
 * 💡 LEARNING: Declaration Merging
 * 
 * This extends Express's namespace to add custom types.
 * Now TypeScript knows about our custom response types throughout the app.
 */
declare global {
  namespace Express {
    /**
     * Custom Request interface extensions
     * 
     * 💡 You can add custom properties here, like:
     * - user?: IUser (after authentication)
     * - requestId?: string (for logging)
     */
    interface Request {
      // Add custom request properties here if needed
      startTime?: number;  // For performance monitoring
    }
  }
}

/**
 * 💡 LEARNING: Type Aliases for Common Patterns
 * 
 * These make our code cleaner by providing shortcuts for common types
 */

// Typed Response for API responses
export type TypedResponse<T = any> = Response<ApiResponse<T>>;

// Typed Response for paginated data
export type PaginatedTypedResponse<T = any> = Response<PaginatedResponse<T>>;

// Request with typed body
export type TypedRequestBody<T> = Request<{}, any, T>;

// Request with typed query
export type TypedRequestQuery<T> = Request<{}, any, any, T>;

// Request with typed params
export type TypedRequestParams<T> = Request<T, any, any>;

// Full typed request (params + body + query)
export type TypedRequest<TParams = {}, TBody = {}, TQuery = {}> = Request<
  TParams,
  any,
  TBody,
  TQuery
>;

/**
 * 💡 USAGE EXAMPLES:
 * 
 * // Before (no type safety):
 * app.post('/users', (req, res) => {
 *   const name = req.body.name;  // TypeScript doesn't know what's in body
 *   res.json({ success: true, data: user });
 * });
 * 
 * // After (with type safety):
 * app.post('/users', (req: TypedRequestBody<CreateUserDTO>, res: TypedResponse<IUser>) => {
 *   const name = req.body.name;  // TypeScript knows body structure
 *   res.json({ success: true, data: user });  // Type-checked response
 * });
 */

export {};  // Make this a module
