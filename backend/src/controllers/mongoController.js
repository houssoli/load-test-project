const mongoService = require('../services/mongoService');

class MongoController {
  // Create user
  async createUser(req, res, next) {
    try {
      const user = await mongoService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = {};
      
      if (req.query.status) {
        filter.status = req.query.status;
      }

      const result = await mongoService.getAllUsers(page, limit, filter);
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const user = await mongoService.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const user = await mongoService.updateUser(req.params.id, req.body);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    try {
      const user = await mongoService.deleteUser(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Search users
  async searchUsers(req, res, next) {
    try {
      const query = req.query.q || '';
      const users = await mongoService.searchUsers(query);
      
      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user stats
  async getUserStats(req, res, next) {
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

  // Lightweight test endpoint for K6
  async testEndpoint(req, res, next) {
    try {
      const count = await mongoService.countUsers();
      res.json({
        success: true,
        message: 'MongoDB test endpoint',
        userCount: count,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MongoController();
