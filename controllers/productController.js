// const Product = require('../models/Product');

// const productController = {
//   createProduct: async (req, res) => {
//     try {
//       // Destructure the required fields from the request body
//       const {
//         dealUrl,
//         title,
//         salePrice,
//         listPrice,
//         description,
//         category,
//         store
//       } = req.body;

//       // Check if all required fields are present
//       if (!dealUrl || !title || !salePrice || !listPrice || !description || !category || !store) {
//         return res.status(400).json({ message: 'All fields are required' });
//       }

//       // Create a new product using the model schema
//       const product = new Product({
//         dealUrl,
//         title,
//         salePrice,
//         listPrice,
//         description,
//         category,
//         store,
//         createdBy: req.user._id, // Associate the product with the logged-in user's ObjectId
//         createdByUsername: req.user.username // Store the username of the user who created the product
//       });

//       // Save the product to the database
//       await product.save();

//       // Respond with the newly created product
//       res.status(201).json(product);
//     } catch (error) {
//       // Handle any errors that occur during the product creation process
//       res.status(500).json({ message: 'Error creating product', error: error.message });
//     }
//   },

//   getProducts: async (req, res) => {
//     try {
//       const products = await Product.find()
//         .populate('createdBy', 'username')
//         .sort({ createdAt: -1 });
//       res.json(products);
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching products' });
//     }
//   },

//   toggleLike: async (req, res) => {
//     try {
//       const product = await Product.findById(req.params.id);
      
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       const userLikeIndex = product.likes.indexOf(req.user._id);
//       const userDislikeIndex = product.dislikes.indexOf(req.user._id);

//       if (userLikeIndex === -1) {
//         if (userDislikeIndex !== -1) {
//           product.dislikes.splice(userDislikeIndex, 1);
//         }
//         product.likes.push(req.user._id);
//       } else {
//         product.likes.splice(userLikeIndex, 1);
//       }

//       await product.save();
//       res.json(product);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating like status' });
//     }
//   },

//   toggleDislike: async (req, res) => {
//     try {
//       const product = await Product.findById(req.params.id);
      
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }

//       const userDislikeIndex = product.dislikes.indexOf(req.user._id);
//       const userLikeIndex = product.likes.indexOf(req.user._id);

//       if (userDislikeIndex === -1) {
//         if (userLikeIndex !== -1) {
//           product.likes.splice(userLikeIndex, 1);
//         }
//         product.dislikes.push(req.user._id);
//       } else {
//         product.dislikes.splice(userDislikeIndex, 1);
//       }

//       await product.save();
//       res.json(product);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating dislike status' });
//     }
//   }
// };

// module.exports = productController;



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
    const { action } = req.params; // 'like' or 'dislike'

    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Handle the 'like' action
      if (action === 'like') {
        if (req.user.dislikedProducts.includes(req.params.id)) {
          // If user disliked the product previously, decrement dislike count and increment like count
          product.dislikeCount -= 1;
          product.likeCount += 1;
          req.user.dislikedProducts = req.user.dislikedProducts.filter(id => id !== req.params.id);
          req.user.likedProducts.push(req.params.id);
        } else {
          // If the product wasn't disliked previously, simply increment like count
          product.likeCount += 1;
          req.user.likedProducts.push(req.params.id);
        }
      }

      // Handle the 'dislike' action
      if (action === 'dislike') {
        if (req.user.likedProducts.includes(req.params.id)) {
          // If user liked the product previously, decrement like count and increment dislike count
          product.likeCount -= 1;
          product.dislikeCount += 1;
          req.user.likedProducts = req.user.likedProducts.filter(id => id !== req.params.id);
          req.user.dislikedProducts.push(req.params.id);
        } else {
          // If the product wasn't liked previously, simply increment dislike count
          product.dislikeCount += 1;
          req.user.dislikedProducts.push(req.params.id);
        }
      }

      // Save the updated product and user
      await product.save();
      await req.user.save(); // Save the user's updated liked/disliked products

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating like/dislike status' });
    }
  }
};

// const productController = {
//   toggleLikeDislike: async (req, res) => {
//     const { action } = req.params; // 'like' or 'dislike'

//     try {
//       // Log the action and product ID
//       console.log(`Action: ${action}, Product ID: ${req.params.id}`);
      
//       // Fetch the product
//       const product = await Product.findById(req.params.id);
//       if (!product) {
//         console.log('Product not found');
//         return res.status(404).json({ message: 'Product not found' });
//       }
//       console.log('Found product:', product);

//       // Handle the 'like' action
//       if (action === 'like') {
//         console.log('Handling like action');
//         if (req.user.dislikedProducts.includes(req.params.id)) {
//           // If user disliked the product previously, decrement dislike count and increment like count
//           console.log('User disliked the product before, toggling counts');
//           product.dislikeCount -= 1;
//           product.likeCount += 1;
//           req.user.dislikedProducts = req.user.dislikedProducts.filter(id => id !== req.params.id);
//           req.user.likedProducts.push(req.params.id);
//         } else {
//           console.log('User has not disliked the product, simply liking it');
//           product.likeCount += 1;
//           req.user.likedProducts.push(req.params.id);
//         }
//       }

//       // Handle the 'dislike' action
//       if (action === 'dislike') {
//         console.log('Handling dislike action');
//         if (req.user.likedProducts.includes(req.params.id)) {
//           // If user liked the product previously, decrement like count and increment dislike count
//           console.log('User liked the product before, toggling counts');
//           product.likeCount -= 1;
//           product.dislikeCount += 1;
//           req.user.likedProducts = req.user.likedProducts.filter(id => id !== req.params.id);
//           req.user.dislikedProducts.push(req.params.id);
//         } else {
//           console.log('User has not liked the product, simply disliking it');
//           product.dislikeCount += 1;
//           req.user.dislikedProducts.push(req.params.id);
//         }
//       }

//       // Save the updated product and user
//       console.log('Saving product and user');
//       await product.save();
//       await req.user.save(); // Save the user's updated liked/disliked products

//       res.json(product);
//     } catch (error) {
//       console.error('Error updating like/dislike status:', error.message);
//       res.status(500).json({ message: 'Error updating like/dislike status', error: error.message });
//     }
//   }
// };


module.exports = productController;

