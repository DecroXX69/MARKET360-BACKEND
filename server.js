// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import the authentication middleware
const auth = require('./middleware/auth'); 

// Routes
app.use('/api/auth', require('./routes/authRoutes')); // Authentication routes (e.g., login, register)
app.use('/api/products', require('./routes/productRoutes')); // Product-related routes
app.use('/api/wishlist', auth, require('./routes/wishlistRoutes'));  // Wishlist routes, protected by auth middleware


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});