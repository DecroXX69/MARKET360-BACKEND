
const Product = require('../models/Product');

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

  // PUT method for toggling like or dislike
  toggleLikeDislike: async (req, res) => {
    try {
        const { productId } = req.params;
        const { action } = req.body;
        const userId = req.user._id;

        console.log('Received rating request:', { productId, action, userId });

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove user from both arrays first
        product.likes = product.likes.filter(id => id.toString() !== userId.toString());
        product.dislikes = product.dislikes.filter(id => id.toString() !== userId.toString());

        // Add user to the appropriate array based on action
        if (action === 'like') {
            product.likes.push(userId);
        } else if (action === 'dislike') {
            product.dislikes.push(userId);
        }

        await product.save();

        console.log('Updated product:', product);

        res.json({
            likes: product.likes.length,
            dislikes: product.dislikes.length,
            userLiked: product.likes.includes(userId),
            userDisliked: product.dislikes.includes(userId)
        });
    } catch (error) {
        console.error('Error in toggleLikeDislike:', error);
        res.status(500).json({ message: 'Error updating rating', error: error.message });
    }
}
};



module.exports = productController;

