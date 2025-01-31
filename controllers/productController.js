const Product = require('../models/Product');
const userActions = new Map();

const productController = {
  createProduct: async (req, res) => {
    try {
      const { dealUrl, title, salePrice, listPrice, description, category, store } = req.body;

      if (!dealUrl || !title || !salePrice || !listPrice || !description || !category || !store) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const product = new Product({
        dealUrl,
        title,
        salePrice,
        listPrice,
        description,
        category,
        store,
        createdBy: req.user._id,
      });

      await product.save();

      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error creating product', error: error.message });
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Product.find()
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  },

  getProductById : async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).populate('createdBy', 'username');
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // PUT method for toggling like or dislike
  // { "userId:productId": "like" or "dislike" }


  toggleLikeDislike: async (req, res) => {
    const { action } = req.params; // 'like' or 'dislike'
    const userId = req.user._id.toString();
    const productId = req.params.id;
    const userKey = `${userId}:${productId}`;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const previousAction = userActions.get(userKey);

      if (action === 'like') {
        if (previousAction === 'like') {
          // If already liked, undo the like
          product.likeCount -= 1;
          userActions.delete(userKey);
        } else {
          // If previously disliked, remove dislike first
          if (previousAction === 'dislike') {
            product.dislikeCount -= 1;
          }
          product.likeCount += 1;
          userActions.set(userKey, 'like');
        }
      } else if (action === 'dislike') {
        if (previousAction === 'dislike') {
          // If already disliked, undo the dislike
          product.dislikeCount -= 1;
          userActions.delete(userKey);
        } else {
          // If previously liked, remove like first
          if (previousAction === 'like') {
            product.likeCount -= 1;
          }
          product.dislikeCount += 1;
          userActions.set(userKey, 'dislike');
        }
      } else {
        return res.status(400).json({ message: "Invalid action. Use 'like' or 'dislike'." });
      }

      await product.save();
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating like/dislike status', error: error.message });
    }
  }

};

module.exports = productController;

