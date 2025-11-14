const postgresService = require('../services/postgresService');

class PostgresController {
  // Create product
  async createProduct(req, res, next) {
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

  // Get all products
  async getAllProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = {};
      
      if (req.query.category) {
        filter.category = req.query.category;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }

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

  // Get product by ID
  async getProductById(req, res, next) {
    try {
      const product = await postgresService.getProductById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product
  async updateProduct(req, res, next) {
    try {
      const product = await postgresService.updateProduct(req.params.id, req.body);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete product
  async deleteProduct(req, res, next) {
    try {
      const product = await postgresService.deleteProduct(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Search products
  async searchProducts(req, res, next) {
    try {
      const query = req.query.q || '';
      const products = await postgresService.searchProducts(query);
      
      res.json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get products by price range
  async getProductsByPriceRange(req, res, next) {
    try {
      const minPrice = parseFloat(req.query.min) || 0;
      const maxPrice = parseFloat(req.query.max) || 999999;
      
      const products = await postgresService.getProductsByPriceRange(minPrice, maxPrice);
      
      res.json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product stats
  async getProductStats(req, res, next) {
    try {
      const stats = await postgresService.getProductStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Lightweight test endpoint for K6
  async testEndpoint(req, res, next) {
    try {
      const count = await postgresService.countProducts();
      res.json({
        success: true,
        message: 'PostgreSQL test endpoint',
        productCount: count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PostgresController();
