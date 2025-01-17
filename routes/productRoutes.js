// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  toggleLike, 
  toggleDislike 
} = require('../controllers/productController');
const auth = require('../middleware/auth');

router.post('/', auth, createProduct);
router.get('/', getProducts);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/dislike', auth, toggleDislike);

module.exports = router;