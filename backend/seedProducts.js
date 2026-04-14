const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const products = [
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling headphones with 30-hour battery life and crystal clear hands-free calling.',
    price: 24999, originalPrice: 32999, category: 'Electronics', brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
    stock: 50, rating: 4.8, numReviews: 128, featured: true
  },
  {
    name: 'Apple iPhone 15 Pro',
    description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera system ever.',
    price: 129999, originalPrice: 134999, category: 'Electronics', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
    stock: 25, rating: 4.9, numReviews: 256, featured: true
  },
  {
    name: 'Nike Air Max 270',
    description: 'Sleek and comfortable running shoes with Max Air unit for all-day comfort.',
    price: 8999, originalPrice: 12999, category: 'Fashion', brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    stock: 100, rating: 4.6, numReviews: 89, featured: true
  },
  {
    name: 'MacBook Air M2',
    description: 'Supercharged by M2 chip. Up to 18 hours of battery life. Fanless design.',
    price: 114999, originalPrice: 119999, category: 'Electronics', brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    stock: 15, rating: 4.9, numReviews: 312, featured: true
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: '100% organic cotton. Soft, breathable and sustainable. Available in multiple colors.',
    price: 999, originalPrice: 1499, category: 'Fashion', brand: 'EcoWear',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    stock: 200, rating: 4.3, numReviews: 45, featured: false
  },
  {
    name: 'Samsung 4K Smart TV 55"',
    description: 'Crystal UHD display with HDR, built-in Alexa and Google Assistant.',
    price: 49999, originalPrice: 65999, category: 'Electronics', brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500',
    stock: 20, rating: 4.7, numReviews: 167, featured: true
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip, eco-friendly TPE yoga mat. 6mm thick for joint support.',
    price: 1999, originalPrice: 2999, category: 'Sports', brand: 'YogaLife',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
    stock: 75, rating: 4.5, numReviews: 62, featured: false
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker & warmer.',
    price: 8999, originalPrice: 11999, category: 'Home & Garden', brand: 'Instant Pot',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
    stock: 40, rating: 4.8, numReviews: 203, featured: false
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'A definitive guide to the best features of JavaScript by Douglas Crockford.',
    price: 599, originalPrice: 799, category: 'Books', brand: "O'Reilly",
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    stock: 150, rating: 4.6, numReviews: 94, featured: false
  },
  {
    name: 'CeraVe Moisturizing Cream',
    description: '24-hour hydration with ceramides and hyaluronic acid for dry to very dry skin.',
    price: 1299, originalPrice: 1599, category: 'Beauty', brand: 'CeraVe',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500',
    stock: 90, rating: 4.7, numReviews: 178, featured: true
  },
  {
    name: 'Adidas Ultraboost 22',
    description: "BOOST midsole for incredible energy return. Primeknit upper that moves with you.",
    price: 14999, originalPrice: 18999, category: 'Fashion', brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
    stock: 60, rating: 4.5, numReviews: 73, featured: false
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Laser reveals invisible dust. Acoustic piezo sensor counts and sizes dust particles.',
    price: 52999, originalPrice: 59999, category: 'Home & Garden', brand: 'Dyson',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    stock: 18, rating: 4.8, numReviews: 141, featured: true
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });