const express = require('express');
const router = express.Router();
const { createProduct, getProducts, toggleLikeDislike } = require('../controllers/productController');
const auth = require('../middleware/auth');

// Create and get products routes
router.post('/', auth, createProduct);
router.get('/', getProducts);

// Update the rating route to match the frontend API call
router.post('/:productId/rating', auth, toggleLikeDislike);

module.exports = router;