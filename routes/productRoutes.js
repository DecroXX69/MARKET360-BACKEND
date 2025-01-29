// const express = require('express');
// const router = express.Router();
// const { 
//   createProduct, 
//   getProducts, 
//   toggleLike, 
//   toggleDislike 
// } = require('../controllers/productController');
// const auth = require('../middleware/auth');

// // Apply the auth middleware to createProduct route to ensure user is authenticated
// router.post('/', auth, createProduct);
// router.get('/', getProducts);
// router.post('/:id/like', auth, toggleLike);
// router.post('/:id/dislike', auth, toggleDislike);

// module.exports = router;
// ;

const express = require('express');
const router = express.Router();
const { createProduct, getProducts, toggleLikeDislike } = require('../controllers/productController');
const auth = require('../middleware/auth');

// Apply the auth middleware to createProduct route to ensure user is authenticated
router.post('/', auth, createProduct);
router.get('/', getProducts);

// Use a generic route for both like and dislike
router.put('/:id/:action', auth, toggleLikeDislike);

module.exports = router;