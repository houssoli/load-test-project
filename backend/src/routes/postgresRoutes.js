const express = require('express');
const router = express.Router();
const postgresController = require('../controllers/postgresController');

// Test endpoint
router.get('/test', postgresController.testEndpoint);

// Product CRUD operations
router.post('/products', postgresController.createProduct);
router.get('/products', postgresController.getAllProducts);
router.get('/products/search', postgresController.searchProducts);
router.get('/products/price-range', postgresController.getProductsByPriceRange);
router.get('/products/stats', postgresController.getProductStats);
router.get('/products/:id', postgresController.getProductById);
router.put('/products/:id', postgresController.updateProduct);
router.delete('/products/:id', postgresController.deleteProduct);

module.exports = router;
