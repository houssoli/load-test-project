/**
 * 📚 TYPESCRIPT LEARNING: Express Router
 * 
 * Routes define URL endpoints and connect them to controllers.
 */

import { Router } from 'express';
import mongoController from '../controllers/mongoController';

/**
 * 💡 LEARNING: Creating a Router
 * 
 * Router() creates a mini Express app for mounting routes
 */
const router: Router = Router();

/**
 * 💡 LEARNING: Route Definitions
 * 
 * HTTP Method + Path + Handler
 * Controllers must be bound or use arrow functions
 */

// Test endpoint
router.get('/test', (req, res, next) => mongoController.testConnection(req, res, next));

// CRUD operations for users
router.post('/users', (req, res, next) => mongoController.createUser(req, res, next));
router.get('/users', (req, res, next) => mongoController.getAllUsers(req, res, next));
router.get('/users/search', (req, res, next) => mongoController.searchUsers(req, res, next));
router.get('/users/stats', (req, res, next) => mongoController.getUserStats(req, res, next));
router.get('/users/:id', (req, res, next) => mongoController.getUserById(req, res, next));
router.patch('/users/:id', (req, res, next) => mongoController.updateUser(req, res, next));
router.delete('/users/:id', (req, res, next) => mongoController.deleteUser(req, res, next));

/**
 * 💡 LEARNING: Default Export
 * 
 * Export router to be mounted in main app
 */
export default router;
