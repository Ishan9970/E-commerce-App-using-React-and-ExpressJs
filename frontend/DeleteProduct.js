import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function DeleteProduct() {
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    if (role !== 'admin' || !token) {
      navigate('/login', { replace: true });
    }
  }, [role, token, navigate]);

  const load = useCallback(() => {
    fetch('http://localhost:3000/api/products-by-category?category=All', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function handleDelete(p) {
    const desc = p.description || 'No description available.';
    if (!window.confirm(`Product Description:\n\n${desc}\n\nAre you sure you want to delete this product?`)) return;
    fetch('http://localhost:3000/api/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: p.id }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          alert('Product deleted');
          load();
        } else {
          alert(result.message || 'Delete failed');
        }
      })
      .catch(() => alert('Server error.'));
  }

  return (
    <div>
      <header style={{ background: '#ff4d4d', padding: 15, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
        <span>Delete Product</span>
        <button onClick={() => navigate('/admin')} style={{ background: '#fff', color: '#ff4d4d', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>Back</button>
      </header>
      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', padding: 25, borderRadius: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 10, background: '#ff6666', color: '#fff' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: 10, background: '#ff6666', color: '#fff' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: 10, background: '#ff6666', color: '#fff' }}>Price</th>
              <th style={{ border: '1px solid #ddd', padding: 10, background: '#ff6666', color: '#fff' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products === null ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 10 }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 10 }}>No Products</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={{ border: '1px solid #ddd', padding: 10 }}>{p.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: 10 }}>{p.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: 10 }}>${Number(p.price).toFixed(2)}</td>
                  <td style={{ border: '1px solid #ddd', padding: 10 }}>
                    <button onClick={() => handleDelete(p)} style={{ background: 'red', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
