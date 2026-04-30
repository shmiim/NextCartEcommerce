import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/products/${id}`).then(r => setProduct(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 60 }}>Product not found.</div>;

  const images = [product.image, ...(product.images || [])].filter(Boolean);
  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => { addToCart(product, qty); toast.success('Added to cart!'); };
  const handleBuyNow = () => { addToCart(product, qty); navigate('/checkout'); };

  return (
    <div className="page-wrapper">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: 24 }}>← Back</button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ background: '#1e1e2e', borderRadius: 16, overflow: 'hidden', aspectRatio: '1/1', marginBottom: 12 }}>
              <img src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)}
                    style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${activeImg === i ? '#6366f1' : 'transparent'}` }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="badge badge-primary" style={{ marginBottom: 12 }}>{product.category}</div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 30, fontWeight: 700, marginBottom: 12 }}>{product.name}</h1>
            {product.brand && <p style={{ color: '#6b6b82', fontSize: 14, marginBottom: 12 }}>Brand: <span style={{ color: '#a1a1b5' }}>{product.brand}</span></p>}
            <div className="stars" style={{ marginBottom: 16 }}>
              {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(product.rating) ? '#f59e0b' : '#2a2a3a', fontSize: 18 }}>★</span>)}
              <span style={{ color: '#6b6b82', fontSize: 13, marginLeft: 6 }}>({product.numReviews} reviews)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice > product.price && (
                <>
                  <span style={{ fontSize: 20, color: '#6b6b82', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>
                  <span className="badge badge-accent">-{discount}%</span>
                </>
              )}
            </div>
            <p style={{ color: '#a1a1b5', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: '#6b6b82' }}>Stock:</span>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </span>
            </div>

            {product.stock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: '#6b6b82' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#1e1e2e', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#f1f1f5', fontSize: 18, cursor: 'pointer' }}>-</button>
                  <span style={{ width: 36, textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 36, height: 36, background: 'none', border: 'none', color: '#f1f1f5', fontSize: 18, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}>🛒 Add to Cart</button>
              <button className="btn btn-primary btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>⚡ Buy Now</button>
            </div>

            <div className="product-detail-features">
              {[['🚚', 'Free Delivery', 'Above ₹499'], ['↩️', 'Easy Return', '7 day policy'], ['🔒', 'Secure Pay', 'Razorpay'], ['✅', 'Genuine', '100% authentic']].map(([icon, t, s]) => (
                <div key={t} className="feature-card">
                  <div className="feature-icon">{icon}</div>
                  <div>
                    <div className="feature-title">{t}</div>
                    <div className="feature-subtitle">{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
