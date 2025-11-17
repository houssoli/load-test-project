/**
 * 📚 TYPESCRIPT LEARNING: Controller Layer with Type Safety
 * 
 * Controllers handle HTTP requests, call services, and return responses.
 * 
 * KEY CONCEPTS:
 * - Typed request/response handlers
 * - Request validation
 * - Error handling
 * - RESTful API patterns
 */

import { Request, Response, NextFunction } from 'express';
import mongoService from '../services/mongoService';
import { 
  TypedResponse, 
  PaginatedTypedResponse,
  TypedRequestBody,
  TypedRequestParams 
} from '../types/express';
import { IUser, CreateUserDTO, UpdateUserDTO } from '../types';

/**
 * 💡 LEARNING: Controller Class
 * 
 * Groups related route handlers together
 */
class MongoController {
  /**
   * 💡 LEARNING: POST Handler - Create User
   * 
   * Request body is typed as CreateUserDTO
   * Response is typed to return IUser
   * 
   * @route POST /api/mongo/users
   */
  async createUser(
    req: TypedRequestBody<CreateUserDTO>,
    res: TypedResponse<IUser>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await mongoService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      /**
       * 💡 LEARNING: Error Forwarding
       * 
       * next(error) passes error to error middleware
       */
      next(error);
    }
  }

  /**
   * 💡 LEARNING: GET Handler - List with Pagination
   * 
   * Query parameters are always strings
   * We parse them to numbers with fallback defaults
   * 
   * @route GET /api/mongo/users?page=1&limit=10&status=active
   */
  async getAllUsers(
    req: Request,
    res: PaginatedTypedResponse<IUser[]>,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * 💡 LEARNING: Parsing Query Parameters
       * 
       * parseInt() converts string to number
       * || provides fallback if NaN
       */
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;
      
      const filter: any = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }

      const result = await mongoService.getAllUsers(page, limit, filter);
      
      res.json({
        success: true,
        data: result.users,
        pagination: {
          ...result.pagination,
          totalPages: result.pagination.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 💡 LEARNING: GET Handler - Single Resource
   * 
   * URL parameter (:id) accessed via req.params
   * 
   * @route GET /api/mongo/users/:id
   */
  async getUserById(
    req: TypedRequestParams<{ id: string }>,
    res: TypedResponse<IUser>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await mongoService.getUserById(req.params.id);
      
      /**
       * 💡 LEARNING: 404 Not Found
       * 
       * If resource doesn't exist, return 404
       * 'return' stops further execution
       */
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 💡 LEARNING: PATCH/PUT Handler - Update Resource
   * 
   * Combines params (id) and body (update data)
   * 
   * @route PATCH /api/mongo/users/:id
   */
  async updateUser(
    req: Request,
    res: TypedResponse<IUser>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await mongoService.updateUser(
        req.params.id,
        req.body as UpdateUserDTO
      );
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 💡 LEARNING: DELETE Handler
   * 
   * Removes a resource
   * Returns 204 No Content or 200 with deleted data
   * 
   * @route DELETE /api/mongo/users/:id
   */
  async deleteUser(
    req: TypedRequestParams<{ id: string }>,
    res: TypedResponse<IUser>,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await mongoService.deleteUser(req.params.id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search users
   * 
   * @route GET /api/mongo/users/search?q=john
   */
  async searchUsers(
    req: Request,
    res: TypedResponse<IUser[]>,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: string = (req.query.q as string) || '';
      
      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
        return;
      }

      const users = await mongoService.searchUsers(query);
      
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * 
   * @route GET /api/mongo/users/stats
   */
  async getUserStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await mongoService.getUserStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test endpoint - health check
   * 
   * @route GET /api/mongo/test
   */
  async testConnection(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    res.json({
      success: true,
      message: 'MongoDB connection is working',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 💡 LEARNING: Singleton Export
 * 
 * Export single instance so all routes use same controller
 */
export default new MongoController();

export { MongoController };
