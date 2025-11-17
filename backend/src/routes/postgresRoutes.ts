/**
 * PostgreSQL Routes with TypeScript
 */

import { Router } from 'express';
import postgresController from '../controllers/postgresController';

const router: Router = Router();

// Test endpoint
router.get('/test', (req, res, next) => postgresController.testConnection(req, res, next));

// CRUD operations for products
router.post('/products', (req, res, next) => postgresController.createProduct(req, res, next));
router.get('/products', (req, res, next) => postgresController.getAllProducts(req, res, next));

// Specific routes MUST come before generic /:id route
router.get('/products/search', (req, res, next) => postgresController.searchProducts(req, res, next));
router.get('/products/price-range', (req, res, next) => postgresController.getProductsByPriceRange(req, res, next));
router.get('/products/stats', (req, res, next) => postgresController.getProductStats(req, res, next));

// Generic ID-based routes come last
router.get('/products/:id', (req, res, next) => postgresController.getProductById(req, res, next));
router.patch('/products/:id', (req, res, next) => postgresController.updateProduct(req, res, next));
router.delete('/products/:id', (req, res, next) => postgresController.deleteProduct(req, res, next));

export default router;
