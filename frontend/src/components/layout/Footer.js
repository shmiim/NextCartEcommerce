import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.12)',
      padding: '48px 0 24px'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              ⚡ Nex<span style={{ color: '#6366f1' }}>Cart</span>
            </div>
            <p style={{ color: '#CBD5E1', fontSize: 13, lineHeight: 1.7 }}>
              Premium e-commerce built with the MERN stack. Fast, secure, and powerful.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Shop</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['All Products', 'Electronics', 'Fashion', 'Home & Garden'].map((l) => (
                <Link key={l} to="/products" style={{ color: '#CBD5E1', fontSize: 13, transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#CBD5E1'}>{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Profile', '/profile'], ['My Orders', '/my-orders'], ['Cart', '/cart'], ['Login', '/login']].map(([l, href]) => (
                <Link key={l} to={href} style={{ color: '#CBD5E1', fontSize: 13 }}
                  onMouseEnter={(e) => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={(e) => e.target.style.color = '#CBD5E1'}>{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 13, color: '#E2E8F0', textTransform: 'uppercase', letterSpacing: 1 }}>Payment</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['💳 Razorpay', '🔒 Secure', '📦 Free Ship'].map(t => (
                <span key={t} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#E2E8F0' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 20, textAlign: 'center', color: '#CBD5E1', fontSize: 13 }}>
          © {new Date().getFullYear()} NexCart. All rights reserved. Built with MERN Stack 🚀
        </div>
      </div>
    </footer>
  );
}
