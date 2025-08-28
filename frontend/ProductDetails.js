import React, { useEffect, useState, useCallback, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { CartContext } from './context/CartContext';

export default function ProductDetails() {
  const { token, userId, logout } = useContext(AuthContext);
  const { cart, setQty } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [qty, setLocalQty] = useState(0);

  useEffect(() => {
    if (!token || !userId) {
      alert('You must be logged in to view product details!');
      logout();
      window.location.href = '/login';
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('id');
    if (!pid) return;

    setLocalQty(cart[pid] ?? 0);

    fetch(`http://localhost:3000/product/${encodeURIComponent(pid)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error('not found'); return res.json(); })
      .then((p) => setProduct(p))
      .catch(() => setProduct(undefined));
  }, [token, userId, cart, logout]);

  const setProductQty = useCallback((productId, quantity) => {
    setQty(productId, quantity);
    setLocalQty(quantity);
  }, [setQty]);

  if (product === undefined) return <div style={{ padding: 30 }}>Product not found.</div>;
  if (!product) return <div style={{ padding: 30 }}>Loading...</div>;

  const pid = String(product.id);

  return (
    <div style={{ maxWidth: 570, margin: '60px auto', background: '#fff', borderRadius: 16, padding: '30px 36px', boxShadow: '0 8px 28px #c0e8ef44' }}>
      {product.image_url && <img src={product.image_url} alt={product.name} style={{ maxWidth: 310, width: '100%', borderRadius: 14, marginBottom: 20 }} />}
      <div style={{ fontSize: '2rem', marginBottom: 15 }}>{product.name}</div>
      <div style={{ fontSize: '1.15rem', marginBottom: 25 }}>{product.description || 'No description available.'}</div>
      <div style={{ fontSize: '1.4rem', color: '#22865e', marginBottom: 22, fontWeight: 600 }}>${Number(product.price).toFixed(2)}</div>
      <div>
        {qty > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setProductQty(pid, Math.max(0, qty - 1))} style={{ border: 'none', padding: 12, color: '#fff', background: '#0896d2', cursor: 'pointer', borderRadius: 8, fontSize: 18, width: 85 }}>-</button>
            <span style={{ display: 'inline-block', minWidth: 24, fontWeight: 'bold', color: '#0896d2', background: '#f5f9fa', borderRadius: 7, fontSize: 25, padding: '0 10px' }}>{qty}</span>
            <button onClick={() => setProductQty(pid, qty + 1)} style={{ border: 'none', padding: 12, color: '#fff', background: '#1ee6c2', cursor: 'pointer', borderRadius: 8, fontSize: 18, width: 85 }}>+</button>
          </span>
        ) : (
          <button onClick={() => setProductQty(pid, 1)} style={{ padding: '12px 30px', fontSize: '1.08rem', background: '#22865e', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', marginTop: 10 }}>Add to Cart</button>
        )}
      </div>
    </div>
  );
}
