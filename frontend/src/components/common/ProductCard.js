import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        <img src={product.image} alt={product.name} className="product-img" />
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {product.stock === 0 && <div className="out-overlay">Out of Stock</div>}
        <div className="card-hover-actions">
          <button className="quick-add" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        </div>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <div className="stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className="star" style={{ color: s <= Math.round(product.rating) ? '#f59e0b' : '#d1d5db' }}>★</span>
            ))}
          </div>
          <span className="rating-count">({product.numReviews})</span>
        </div>
        <div className="product-price-row">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="product-original">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
