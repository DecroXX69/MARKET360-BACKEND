const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const { uploadImage } = require('./cloudinary');
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const productController = {
  // Create a new product with image upload
  // createProduct: async (req, res) => {
  //   try {
  //     const {
  //       dealUrl, title, salePrice, listPrice, description, category, store
  //     } = req.body;

  //     const productData = {
  //       dealUrl,
  //       title,
  //       salePrice,
  //       listPrice,
  //       description,
  //       category,
  //       store,
  //       createdBy: req.user._id,
  //     };

  //     // Handle image uploads
  //     const images = req.files?.length > 0 ? await Promise.all(req.files.map(uploadImage)) : [];
  //     productData.images = images;

  //     const product = new Product(productData);
  //     await product.save();

  //     res.status(201).json(product);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating product', error: error.message });
  //   }
  // },

  createProduct: async (req, res) => {
    try {
        console.log(req.files);  // Log files received from Multer
        console.log(req.body);   // Log the rest of the form data

        const { dealUrl, title, salePrice, listPrice, description, category, store } = req.body;
        const images = req.files;

        const productData = {
            dealUrl,
            title,
            salePrice,
            listPrice,
            description,
            category,
            store,
            createdBy: req.user._id,  // Assuming you have user info in the request
            images: [],
        };

        // Handle image uploads if any images were received
        if (images && images.length > 0) {
            // Upload each image and retrieve its URL and public ID
            const uploadedImages = await Promise.all(images.map(file => uploadImage(file)));  
            
            // Assuming uploadImage returns an object with the image URL and public ID
            productData.images = uploadedImages.map(image => ({
                url: image.url,         // URL of the uploaded image
                public_id: image.public_id,  // Public ID for the image (if using a service like Cloudinary)
            }));
        }

        // Create and save the product to the database
        const product = new Product(productData);
        await product.save();

        res.status(201).json(product);  // Respond with the newly created product
    } catch (error) {
        console.error(error);  // Log any error
        res.status(500).json({
            message: 'Error creating product',
            error: error.message,
        });
    }
},

  // Get all products with filtering
  getProducts: async (req, res) => {
    try {
      const { min, max, categories, search } = req.query;
      const query = {};

      if (min && max) {
        query.salePrice = { $gte: parseFloat(min), $lte: parseFloat(max) };
      }

      if (categories) {
        const categoryList = Array.isArray(categories) ? categories : categories.split(',');
        query.category = { $in: categoryList };
      }

      if (search) {
        query.$text = { $search: search };
      }

      const products = await Product.find(query)
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .lean();

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching products' });
    }
  },

  // Get a single product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate('createdBy', 'username')
        .lean();
      
      if (!product) return res.status(404).json({ message: 'Product not found' });

      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Toggle product like/dislike
  toggleLikeDislike: async (req, res) => {
    try {
      const userId = req.user._id.toString();
      const productId = req.params.id;
      const userKey = `${userId}:${productId}`;
      const action = req.params.action;

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (action === 'like') {
        if (!product.likes.includes(userId)) {
          product.likes.push(userId);
        }
        product.dislikes = product.dislikes.filter(id => id !== userId);
      } else if (action === 'dislike') {
        if (!product.dislikes.includes(userId)) {
          product.dislikes.push(userId);
        }
        product.likes = product.likes.filter(id => id !== userId);
      }

      product.likeCount = product.likes.length;
      product.dislikeCount = product.dislikes.length;

      await product.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating like/dislike status', error: error.message });
    }
  },

  // Update product information
  updateProduct: async (req, res) => {
    try {
      const allowedUpdates = ['dealUrl', 'title', 'salePrice', 'listPrice', 'description', 'category', 'store'];
      const product = await Product.findById(req.params.id);

      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to edit this product' });
      }

      const productUpdates = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          productUpdates[key] = req.body[key];
        }
      }

      // Handle image updates
      if (req.files && req.files.length > 0) {
        // Remove existing images
        if (product.images.length > 0) {
          await Promise.all(product.images.map(async (image) => {
            try {
              await cloudinary.uploader.destroy(image.public_id);
            } catch (err) {
              console.error('Error deleting image:', err);
            }
          }));
        }

        productUpdates.images = await Promise.all(req.files.map(uploadImage));
      }

      Object.assign(product, productUpdates);
      await product.save();

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product', error: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) return res.status(404).json({ message: 'Product not found' });

      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this product' });
      }

      // Delete uploaded images
      if (product.images.length > 0) {
        await Promise.all(product.images.map(async (image) => {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (err) {
            console.error('Error deleting image:', err);
          }
        }));
      }

      await product.deleteOne();
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
  },
};

module.exports = productController;