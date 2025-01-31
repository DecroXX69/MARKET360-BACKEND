const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, toggleLikeDislike } = require('../controllers/productController');
const auth = require('../middleware/auth');

// Create and get products routes
router.post('/', auth, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id/:action', auth, toggleLikeDislike);

module.exports = router;