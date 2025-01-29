const Product = require('../models/Product');

const productController = {
  createProduct: async (req, res) => {
    try {
      // Destructure the required fields from the request body
      const {
        dealUrl,
        title,
        salePrice,
        listPrice,
        description,
        category,
        store
      } = req.body;

      // Check if all required fields are present
      if (!dealUrl || !title || !salePrice || !listPrice || !description || !category || !store) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Create a new product using the model schema
      const product = new Product({
        dealUrl,
        title,
        salePrice,
        listPrice,
        description,
        category,
        store,
        createdBy: req.user._id, // Associate the product with the logged-in user's ObjectId
        createdByUsername: req.user.username // Store the username of the user who created the product
      });

      // Save the product to the database
      await product.save();

      // Respond with the newly created product
      res.status(201).json(product);
    } catch (error) {
      // Handle any errors that occur during the product creation process
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

  toggleLike: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const userLikeIndex = product.likes.indexOf(req.user._id);
      const userDislikeIndex = product.dislikes.indexOf(req.user._id);

      if (userLikeIndex === -1) {
        if (userDislikeIndex !== -1) {
          product.dislikes.splice(userDislikeIndex, 1);
        }
        product.likes.push(req.user._id);
      } else {
        product.likes.splice(userLikeIndex, 1);
      }

      await product.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating like status' });
    }
  },

  toggleDislike: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const userDislikeIndex = product.dislikes.indexOf(req.user._id);
      const userLikeIndex = product.likes.indexOf(req.user._id);

      if (userDislikeIndex === -1) {
        if (userLikeIndex !== -1) {
          product.likes.splice(userLikeIndex, 1);
        }
        product.dislikes.push(req.user._id);
      } else {
        product.dislikes.splice(userDislikeIndex, 1);
      }

      await product.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating dislike status' });
    }
  }
};

module.exports = productController;
