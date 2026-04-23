import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('all'); // 'all' | 'upi' | 'card' | 'netbanking' | 'wallet'
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: 'India'
  });

  const shipping = cartTotal > 499 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.18);
  const total = cartTotal + shipping + tax;

  const handleChange = (e) => setAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRazorpay = async () => {
    const { street, city, state, pincode } = address;
    if (!street || !city || !state || !pincode) { toast.error('Please fill all address fields'); return; }
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (!window.Razorpay) { toast.error('Razorpay checkout failed to load'); return; }

    setLoading(true);
    try {
      // 1. Create order in DB
      const orderItems = cart.map(item => ({
        product: item._id, name: item.name, image: item.image,
        price: item.price, quantity: item.quantity
      }));
      const { data: order } = await API.post('/orders', {
        orderItems, shippingAddress: address,
        itemsPrice: cartTotal, shippingPrice: shipping,
        taxPrice: tax, totalPrice: total
      });

      // 2. Create Razorpay order
      const { data: rzpData } = await API.post('/payment/create-order', {
        amount: total, orderId: order._id
      });

      const preferredMethod = payMethod === 'all' ? undefined : payMethod;
      const customerPhone = user?.phone
        ? (String(user.phone).startsWith('+') ? String(user.phone) : `+91${String(user.phone)}`)
        : '+919999999999';

      // Use the standard Checkout configuration so Razorpay can expose the
      // currently supported test methods without custom block restrictions.
      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        name: 'NexCart',
        description: `Order #${order._id.slice(-6).toUpperCase()}`,
        image: 'https://img.icons8.com/fluency/48/lightning-bolt.png',
        order_id: rzpData.razorpay_order_id,

        handler: async (response) => {
          try {
            await API.post('/payment/verify', { ...response, orderId: order._id });
            clearCart();
            toast.success('Payment successful! Order placed 🎉');
            navigate(`/orders/${order._id}`);
          } catch {
            toast.error('Payment verification failed');
            setLoading(false);
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
          contact: customerPhone,
        },

        notes: { orderId: order._id },
        theme: { color: '#6366f1' },
        retry: { enabled: true },
        config: {
          display: {
            language: 'en',
            sequence: payMethod === 'upi'
              ? ['upi', 'card', 'netbanking', 'wallet']
              : payMethod === 'card'
                ? ['card', 'upi', 'netbanking', 'wallet']
                : payMethod === 'netbanking'
                  ? ['netbanking', 'upi', 'card', 'wallet']
                  : payMethod === 'wallet'
                    ? ['wallet', 'upi', 'card', 'netbanking']
                    : ['upi', 'card', 'netbanking', 'wallet'],
            preferences: {
              show_default_blocks: false
            }
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled');
          },
          confirm_close: true,
          escape: false
        },
        ...(preferredMethod ? { method: preferredMethod } : {})
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error?.description || 'Try again'}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Checkout failed';
      toast.error(message);
      setLoading(false);
    }
  };

  const payMethods = [
    { id: 'all',        icon: '💳', label: 'All Methods' },
    { id: 'upi',        icon: '📱', label: 'UPI' },
    { id: 'card',       icon: '🏧', label: 'Card' },
    { id: 'netbanking', icon: '🏦', label: 'Net Banking' },
    { id: 'wallet',     icon: '👛', label: 'Wallet' },
  ];

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="page-title">Checkout</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 28, alignItems: 'start' }}>
          {/* LEFT — Address + Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Shipping Address */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                📍 Shipping Address
              </h3>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input className="form-input" name="street" value={address.street} onChange={handleChange} placeholder="123 Main St, Apt 4" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" name="city" value={address.city} onChange={handleChange} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" name="state" value={address.state} onChange={handleChange} placeholder="Maharashtra" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">PIN Code</label>
                  <input className="form-input" name="pincode" value={address.pincode} onChange={handleChange} placeholder="400001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" name="country" value={address.country} readOnly style={{ opacity: 0.6 }} />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16 }}>💳 Payment Method</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
                {payMethods.map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '14px 8px', borderRadius: 12, border: '2px solid',
                      borderColor: payMethod === m.id ? '#6366f1' : 'rgba(255,255,255,0.08)',
                      background: payMethod === m.id ? 'rgba(99,102,241,0.12)' : '#1e1e2e',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: payMethod === m.id ? '#818cf8' : '#6b6b82' }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* UPI guidance when UPI selected */}
              {payMethod === 'upi' && (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>📱</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>UPI Test Mode</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#6b6b82', marginTop: 10 }}>
                    Razorpay opens its standard UPI sheet directly. On desktop, use the QR flow; on mobile, use a supported UPI app from the popup.
                  </p>
                  <p style={{ fontSize: 11, color: '#fbbf24', marginTop: 8 }}>
                    Manual UPI ID collect is deprecated by Razorpay from February 28, 2026, so this checkout no longer forces a typed UPI ID.
                  </p>
                </div>
              )}

              {/* QR hint */}
              {payMethod === 'all' && (
                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <span style={{ fontSize: 13, color: '#6ee7b7' }}>UPI, Cards, Net Banking & Wallets all available in the payment popup</span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 16 }}>🛍️ Order Items</h3>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <img src={item.image} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b6b82' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Summary + Pay */}
          <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-body">
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
              {[
                ['Subtotal', `₹${cartTotal.toLocaleString()}`],
                ['Shipping', shipping === 0 ? 'FREE 🎉' : `₹${shipping}`],
                ['GST (18%)', `₹${tax.toLocaleString()}`]
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: '#a1a1b5' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: v.includes('FREE') ? '#10b981' : '#f1f1f5' }}>{v}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
                <span>Total</span>
                <span style={{ color: '#818cf8' }}>₹{total.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', gap: 10, fontSize: 16 }}
                onClick={handleRazorpay}
                disabled={loading}
              >
                {loading ? '⏳ Processing...' : payMethod === 'upi' ? '📱 Pay via UPI' : '💳 Pay with Razorpay'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: '#6b6b82' }}>🔒 256-bit SSL secured by Razorpay</span>
              </div>
            </div>

            {/* Accepted methods card */}
            <div className="card card-body">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#a1a1b5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Accepted Payments</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { icon: '📱', label: 'UPI', sub: 'GPay, PhonePe, Paytm' },
                  { icon: '💳', label: 'Cards', sub: 'Visa, Mastercard, Rupay' },
                  { icon: '🏦', label: 'Net Banking', sub: 'All major banks' },
                  { icon: '👛', label: 'Wallets', sub: 'Paytm, Amazon Pay' },
                ].map(p => (
                  <div key={p.label} style={{ background: '#1e1e2e', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: '#6b6b82', marginTop: 2 }}>{p.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: '#fbbf24' }}>🧪 <strong>Test Mode:</strong> For cards use <code>4111 1111 1111 1111</code>, any future expiry, any 3-digit CVV, and OTP <code>1234</code>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
