const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  dealUrl: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  salePrice: {
    type: Number,
    required: true
  },
  listPrice: {
    type: Number,
    required: true
  },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }
    }
  ],  // This is changed to an array of image objects

  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  store: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  dislikeCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
