import React, { useEffect, useMemo, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function Cart() {
  const { token, userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const CART_KEY = useMemo(() => `user_cart_quantities_${userId}`, [userId]);

  const [items, setItems] = useState([]); // {product, qty, subtotal}
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !userId) {
      navigate('/login', { replace: true });
      return;
    }

    let cart = {};
    try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { cart = {}; }

    const productIds = Object.keys(cart);
    if (productIds.length === 0) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    Promise.all(
      productIds.map((pid) =>
        fetch(`http://localhost:3000/product/${encodeURIComponent(pid)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null),
      ),
    )
      .then((products) => {
        let t = 0;
        const mapped = products
          .map((prod, idx) => {
            if (!prod) return null;
            const pid = productIds[idx];
            const qty = cart[pid];
            const subtotal = Number(prod.price) * qty;
            t += subtotal;
            return { product: prod, qty, subtotal };
          })
          .filter(Boolean);
        setItems(mapped);
        setTotal(t);
      })
      .finally(() => setLoading(false));
  }, [token, userId, CART_KEY, navigate]);

  const goToPayment = useCallback(() => {
    // Persist a fresh snapshot of the cart under both the per-user key and the legacy key
    try {
      // Prefer what we have in localStorage already
      let current = {};
      try { current = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { current = {}; }

      // Fallback: reconstruct from items if needed
      if (!current || Object.keys(current).length === 0) {
        const rebuilt = {};
        for (const { product, qty } of items) {
          if (qty > 0) rebuilt[String(product.id)] = qty;
        }
        current = rebuilt;
      }

      // Save to both keys for compatibility with older flows
      localStorage.setItem(CART_KEY, JSON.stringify(current));
      localStorage.setItem('user_cart_quantities', JSON.stringify(current));
    } catch {}

    localStorage.setItem('payment_amount', String(total.toFixed(2)));
    navigate('/payment');
  }, [total, navigate, items, CART_KEY]);

  return (
    <div style={{ maxWidth: 720, margin: '50px auto', background: '#fff', borderRadius: 18, padding: '36px 38px 24px', boxShadow: '0 8px 40px #4de7b21f, 0 2px 8px #1ee6c245', minHeight: '50vh' }}>
      <div style={{ fontSize: '2rem', color: '#15b892', fontWeight: 'bold', textAlign: 'center', marginBottom: 22 }}>Your Shopping Cart</div>
      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 30, color: '#999' }}>Your cart is empty.</div>
      ) : (
        <>
          <div>
            {items.map(({ product, qty, subtotal }) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fdfc', marginBottom: 20, borderRadius: 12, padding: 14, border: '1.5px solid #d3f2ea' }}>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 12 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                  <div>Price: ${Number(product.price).toFixed(2)}</div>
                  <span style={{ color: '#1ee6c2', fontWeight: 600 }}>Quantity: {qty}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: '#15846a' }}>${subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '1.5rem', background: '#7cf6da', color: '#046957', padding: 14, borderRadius: 10, textAlign: 'right' }}>Total Amount: ${total.toFixed(2)}</div>
          {total > 0 && (
            <div style={{ textAlign: 'right', marginTop: 15 }}>
              <button onClick={goToPayment} style={{ background: '#1ee6c2', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Pay Now</button>
            </div>
          )}
        </>
      )}
      <div style={{ textAlign: 'right', marginTop: 15 }}>
        <button onClick={() => navigate('/welcome')} style={{ background: '#1ee6c2', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>← Continue Shopping</button>
      </div>
    </div>
  );
}
