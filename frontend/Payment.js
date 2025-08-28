import React, { useMemo, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { CartContext } from './context/CartContext';

export default function Payment() {
  const { token, userId } = useContext(AuthContext);
  const { cart: ctxCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Resolve token and userId robustly from context or localStorage
  const resolvedToken = token ?? localStorage.getItem('token') ?? localStorage.getItem('jwtToken') ?? null;
  const resolvedUserId = useMemo(() => {
    if (userId != null) return userId;
    const fromLS = localStorage.getItem('userId');
    return fromLS != null ? Number(fromLS) : null;
  }, [userId]);

  const CART_KEY = useMemo(() => `user_cart_quantities_${resolvedUserId}`, [resolvedUserId]);

  useEffect(() => {
    if (!resolvedToken || !resolvedUserId) {
      navigate('/login', { replace: true });
    }
  }, [resolvedToken, resolvedUserId, navigate]);

  const [method, setMethod] = useState('GooglePay');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('Processing your payment...');
  const [success, setSuccess] = useState(false);

  const getCart = () => {
    // Prefer localStorage (authoritative for persistence). Merge legacy/fallback keys if needed.
    const merged = {};

    // 1) Current per-user key
    try {
      const cur = JSON.parse(localStorage.getItem(CART_KEY)) || {};
      if (cur && typeof cur === 'object') Object.assign(merged, cur);
    } catch {}

    // 2) Legacy global key (from older builds)
    try {
      const legacy = JSON.parse(localStorage.getItem('user_cart_quantities')) || {};
      if (legacy && typeof legacy === 'object') Object.assign(merged, legacy);
    } catch {}

    // 3) Any other keys that match user_cart_quantities* (just in case)
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k === CART_KEY) continue;
        if (/^user_cart_quantities(\b|_)/.test(k)) {
          try {
            const data = JSON.parse(localStorage.getItem(k)) || {};
            if (data && typeof data === 'object') Object.assign(merged, data);
          } catch {}
        }
      }
    } catch {}

    // 4) Fallback to context cart
    if (Object.keys(merged).length === 0 && ctxCart && typeof ctxCart === 'object') {
      Object.assign(merged, ctxCart);
    }

    // Persist merged back to the per-user key so future reads are consistent
    try { localStorage.setItem(CART_KEY, JSON.stringify(merged)); } catch {}

    return merged;
  };

  async function handlePay() {
    const c = getCart();
    const entries = Object.entries(c).filter(([_, q]) => Number(q) > 0);
    if (entries.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setProcessing(true);
    try {
      const products = entries.map(([pid]) => pid);
      const quantities = entries.map(([_, q]) => Number(q));
      const res = await fetch('http://localhost:3000/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resolvedToken}` },
        body: JSON.stringify({ userId: resolvedUserId, payment_mode: method, products, quantities }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          localStorage.removeItem(CART_KEY);
          localStorage.removeItem('user_cart_quantities');
          // Remove any other prefixed keys from legacy flows
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && /^user_cart_quantities(\b|_)/.test(k)) {
              localStorage.removeItem(k);
            }
          }
        } catch {}
        try { clearCart && clearCart(); } catch {}
        setTimeout(() => {
          setStatus('Payment Successful!');
          setSuccess(true);
        }, 2200);
      } else {
        setStatus(data.message || 'Payment failed.');
      }
    } catch (e) {
      setStatus('Error connecting to payment server.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40, minHeight: '100vh', background: 'linear-gradient(135deg, #f0fefc, #ccf5eb)' }}>
      <h2 style={{ color: '#15846a', marginBottom: 20 }}>Select Payment Method</h2>
      <div style={{ background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 6px 20px rgba(0,0,0,0.06)', width: 280, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 25 }}>
        {['GooglePay', 'UPI', 'Card'].map((m) => (
          <label key={m} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', borderRadius: 8, border: '1.8px solid #1ee6c2', background: '#f8fffe', cursor: 'pointer' }}>
            <input type="radio" name="paymentMethod" value={m} checked={method === m} onChange={() => setMethod(m)} />
            {m}
          </label>
        ))}
      </div>
      <button onClick={handlePay} style={{ padding: '12px 28px', background: '#1ee6c2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }}>Proceed to Pay</button>

      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(135deg, #f0fefc, #ccf5eb)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {!success && <div style={{ border: '6px solid #c1f7e9', borderTop: '6px solid #1ee6c2', borderRadius: '50%', width: 70, height: 70, animation: 'spin 1s linear infinite' }} />}
          <div style={{ fontSize: '1.1rem', color: '#15846a', fontWeight: 600 }}>{status}</div>
          {success && (
            <>
              <div style={{ width: 80, height: 80, background: '#15b892', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 52 52" width="50" height="50"><path fill="none" stroke="#fff" strokeWidth="5" d="M14 27 l7 7 l16 -16" /></svg>
              </div>
              <button onClick={() => navigate('/welcome')} style={{ padding: '12px 24px', background: '#1ee6c2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Continue</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
