import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 499 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) return (
    <div className="cart-page">
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 28, marginBottom: 12, color: '#111827' }}>Your cart is empty</h2>
        <p style={{ color: '#6B7280', marginBottom: 28 }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page-header">
          <h1 className="cart-title">Shopping Cart <span className="cart-title-count">({cart.length} items)</span></h1>
          <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear All</button>
        </div>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-list">
            {cart.map(item => (
              <div key={item._id} className="cart-item-card">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <Link to={`/products/${item._id}`} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-category">{item.category}</div>
                  <div className="cart-item-price">₹{item.price.toLocaleString()}</div>
                </div>
                <div className="cart-qty-control">
                  <button onClick={() => updateQty(item._id, item.quantity - 1)} className="cart-qty-btn" aria-label="Decrease quantity">-</button>
                  <span className="cart-qty-value">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)} className="cart-qty-btn" aria-label="Increase quantity">+</button>
                </div>
                <div className="cart-item-total-wrap">
                  <div className="cart-item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button onClick={() => removeFromCart(item._id)} className="cart-remove-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>
            {[['Subtotal', `₹${cartTotal.toLocaleString()}`], ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`], ['GST (18%)', `₹${tax.toLocaleString()}`]].map(([label, val]) => (
              <div key={label} className="cart-summary-row">
                <span className="cart-summary-label">{label}</span>
                <span className={val === 'FREE' ? 'cart-summary-value cart-summary-value-free' : 'cart-summary-value'}>{val}</span>
              </div>
            ))}
            <div className="divider" />
            <div className="cart-summary-total-row">
              <span className="cart-summary-total-label">Total</span>
              <span className="cart-summary-total-value">₹{total.toLocaleString()}</span>
            </div>
            {shipping > 0 && <p className="cart-shipping-note">Add ₹{(499 - cartTotal).toLocaleString()} more for free shipping!</p>}
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleCheckout}>Proceed to Checkout →</button>
            <Link to="/products" className="cart-continue-link">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
