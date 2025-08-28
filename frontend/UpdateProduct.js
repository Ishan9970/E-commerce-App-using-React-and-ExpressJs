import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function UpdateProduct() {
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState({ id: '', name: '', price: '', description: '' });
  const [msg, setMsg] = useState('');

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

  function openModal(p) {
    setEdit({ id: p.id, name: p.name, price: p.price, description: p.description || '' });
    setMsg('');
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); }

  function onSubmit(e) {
    e.preventDefault();
    if (!edit.name.trim() || !edit.price) { setMsg('Name/price required'); return; }
    setMsg('Updating...');
    fetch('http://localhost:3000/api/update-product', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: edit.id, name: edit.name.trim(), price: parseFloat(edit.price), description: edit.description }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setMsg('Product updated!');
          setTimeout(() => { closeModal(); load(); }, 800);
        } else { setMsg(result.message || 'Update failed'); }
      })
      .catch(() => setMsg('Server error during update'));
  }

  const thStyle = { border: '1px solid #ddd', padding: 10, background: '#fbb034', color: '#fff' };
  const tdStyle = { border: '1px solid #ddd', padding: 10, textAlign: 'center' };

  return (
    <div>
      <header style={{ background: '#fbb034', padding: 15, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
        <span>Update Product</span>
        <button onClick={() => navigate('/admin')} style={{ background: '#fff', color: '#fbb034', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>Back</button>
      </header>

      <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', padding: 25, borderRadius: 10, boxShadow: '0px 4px 15px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Description</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 10 }}>Loading or No Products</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td style={tdStyle}>{p.id}</td>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>${Number(p.price).toFixed(2)}</td>
                  <td style={tdStyle}>{p.description ? String(p.description).replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'No description'}</td>
                  <td style={tdStyle}><button onClick={() => openModal(p)} style={{ background: 'orange', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' }}>Edit</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', background: '#fff', padding: '30px 28px', borderRadius: 12, boxShadow: '0 6px 28px rgba(0,0,0,0.16)', width: 370, maxWidth: '97vw', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span onClick={closeModal} style={{ position: 'absolute', right: 24, top: 24, cursor: 'pointer', color: '#aaa', fontSize: '1.7rem' }}>&times;</span>
            <h2>Edit Product</h2>
            <form onSubmit={onSubmit}>
              <input type="hidden" value={edit.id} />
              <label style={{ display: 'block', fontWeight: 'bold', marginTop: 2 }}>Name</label>
              <input style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box', marginBottom: 6 }} type="text" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} required />
              <label style={{ display: 'block', fontWeight: 'bold', marginTop: 2 }}>Price ($)</label>
              <input style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box', marginBottom: 6 }} type="number" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} required min="0.01" step="0.01" />
              <label style={{ display: 'block', fontWeight: 'bold', marginTop: 2 }}>Description</label>
              <textarea style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', boxSizing: 'border-box', marginBottom: 6, minHeight: 80 }} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
              <button type="submit" style={{ background: '#fbb034', color: '#fff', border: 'none', padding: 10, borderRadius: 6, fontWeight: 'bold', fontSize: '1.1rem', marginTop: 4 }}>Update Product</button>
            </form>
            <p style={{ margin: '0.6em 0 0', color: msg === 'Product updated!' ? 'green' : 'red' }}>{msg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
