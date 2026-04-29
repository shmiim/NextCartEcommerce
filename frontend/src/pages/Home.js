import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products/featured')
      .then(res => setFeatured(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Electronics', icon: '💻', color: '#111' },
    { name: 'Fashion', icon: '👗', color: '#111' },
    { name: 'Home & Garden', icon: '🏡', color: '#111' },
    { name: 'Sports', icon: '⚽', color: '#111' },
    { name: 'Books', icon: '📚', color: '#111' },
    { name: 'Beauty', icon: '💄', color: '#111' },
  ];

  const features = [
    { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹499' },
    { icon: '🔒', title: 'Secure Payment', sub: 'Razorpay protected' },
    { icon: '↩️', title: 'Easy Returns', sub: '7 day returns' },
    { icon: '💬', title: '24/7 Support', sub: 'Always available' },
  ];

  return (
    <div className="home-wrapper">
      {/* HERO SECTION */}
      <section 
        className="hero" 
        style={{ backgroundImage: `url('/images/cyber-monday-shopping-sales.jpg')` }}
      >
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Shop Smarter with NexCart</h1>
            <p className="hero-sub">
              Discover premium products, smooth checkout, and a modern shopping experience built for speed.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-hero-primary">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-hero-secondary">View Collections</Link>
            </div>
            
            <div className="hero-badges">
              <div className="hero-badge-pill">
                <span className="pill-icon">🚚</span> Fast Delivery
              </div>
              <div className="hero-badge-pill">
                <span className="pill-icon">🔒</span> Secure Payment
              </div>
              <div className="hero-badge-pill">
                <span className="pill-icon">↩️</span> Easy Returns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <Link to="/products" className="see-all">See all categories →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link 
                key={cat.name} 
                to={`/products?category=${encodeURIComponent(cat.name)}`} 
                className="cat-card"
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="see-all">View all products →</Link>
          </div>
          
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                No featured products yet. Add some from backend!
              </h3>
              <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
                We're currently restocking our premium collection.
              </p>
              <Link to="/products" className="btn btn-primary btn-lg">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
