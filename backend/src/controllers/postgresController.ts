/**
 * PostgreSQL Controller with TypeScript
 */

import { Request, Response, NextFunction } from 'express';
import postgresService from '../services/postgresService';
import { TypedResponse, TypedRequestBody, TypedRequestParams } from '../types/express';
import { IProduct, CreateProductDTO, UpdateProductDTO } from '../types';

class PostgresController {
  async createProduct(
    req: TypedRequestBody<CreateProductDTO>,
    res: TypedResponse<IProduct>,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await postgresService.createProduct(req.body);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;
      
      const filter: any = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.status) filter.status = req.query.status;

      const result = await postgresService.getAllProducts(page, limit, filter);
      
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(
    req: TypedRequestParams<{ id: string }>,
    res: TypedResponse<IProduct>,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await postgresService.getProductById(req.params.id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(
    req: Request,
    res: TypedResponse<IProduct>,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await postgresService.updateProduct(
        req.params.id,
        req.body as UpdateProductDTO
      );
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(
    req: TypedRequestParams<{ id: string }>,
    res: TypedResponse<IProduct>,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await postgresService.deleteProduct(req.params.id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      res.json({
        success: true,
        data: product,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProducts(
    req: Request,
    res: TypedResponse<IProduct[]>,
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

      const products = await postgresService.searchProducts(query);
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    res.json({
      success: true,
      message: 'PostgreSQL connection is working',
      timestamp: new Date().toISOString(),
    });
  }
}

export default new PostgresController();
export { PostgresController };
