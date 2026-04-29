import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/products/featured').then(r => setFeatured(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Electronics', icon: '💻', color: '#6366f1' },
    { name: 'Fashion', icon: '👗', color: '#ec4899' },
    { name: 'Home & Garden', icon: '🏡', color: '#10b981' },
    { name: 'Sports', icon: '⚽', color: '#f59e0b' },
    { name: 'Books', icon: '📚', color: '#8b5cf6' },
    { name: 'Beauty', icon: '💄', color: '#f43f5e' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Shop Smarter with NexCart
            </h1>
            <p className="hero-sub">
              Discover premium products, smooth checkout, and a modern shopping experience built for speed.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-outline btn-lg">View Collections</Link>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <span className="feature-icon-small">🚚</span> Fast Delivery
              </div>
              <div className="hero-feature">
                <span className="feature-icon-small">🔒</span> Secure Payment
              </div>
              <div className="hero-feature">
                <span className="feature-icon-small">↩️</span> Easy Returns
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by <span className="gradient-text">Category</span></h2>
            <Link to="/products" className="see-all">See all →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="cat-card" style={{ '--cat-color': cat.color }}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured <span className="gradient-text">Products</span></h2>
            <Link to="/products" className="see-all">View all →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
              <p style={{ color: 'var(--text2)' }}>No featured products yet. Add some from the backend!</p>
              <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* Features banner */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '🚚', title: 'Free Delivery', sub: 'On orders above ₹499' },
              { icon: '🔒', title: 'Secure Payment', sub: 'Razorpay protected' },
              { icon: '↩️', title: 'Easy Returns', sub: '7-day return policy' },
              { icon: '💬', title: '24/7 Support', sub: 'Always here to help' },
            ].map(f => (
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
