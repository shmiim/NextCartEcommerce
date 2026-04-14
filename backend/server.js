require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://next-cart-ecommerce.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString('en-IN');
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'NexCart API Running 🚀' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 NexCart Server started');
  console.log(`📡 Port     : ${PORT}`);
  console.log(`🌍 URL      : http://localhost:${PORT}`);
  console.log(`🔑 Razorpay : ${process.env.RAZORPAY_KEY_ID}`);
  console.log('========================================\n');
});