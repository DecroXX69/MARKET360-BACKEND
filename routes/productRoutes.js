const multer = require('multer');
const express = require('express');
const router = express.Router();
const { createProduct, getProducts, getProductById, toggleLikeDislike } = require('../controllers/productController');
const auth = require('../middleware/auth');

// Multer configuration for handling image uploads
const storage = multer.memoryStorage();  // This stores files in memory
const upload = multer({ storage: storage }).array('images[]');  // Accept an array of files under 'images[]'

// Define the routes
router.post('/', auth, upload, createProduct);  // Add upload as middleware here
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id/:action', auth, toggleLikeDislike);

module.exports = router;
