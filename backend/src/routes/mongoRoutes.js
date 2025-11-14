const express = require('express');
const router = express.Router();
const mongoController = require('../controllers/mongoController');

// Test endpoint
router.get('/test', mongoController.testEndpoint);

// User CRUD operations
router.post('/users', mongoController.createUser);
router.get('/users', mongoController.getAllUsers);
router.get('/users/search', mongoController.searchUsers);
router.get('/users/stats', mongoController.getUserStats);
router.get('/users/:id', mongoController.getUserById);
router.put('/users/:id', mongoController.updateUser);
router.delete('/users/:id', mongoController.deleteUser);

module.exports = router;
