import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function InsertProduct() {
  const { token, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (role !== 'admin' || !token) {
      navigate('/login', { replace: true });
    }
  }, [role, token, navigate]);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(String(ev.target?.result || ''));
      reader.readAsDataURL(f);
    } else {
      setPreview('');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    const { name, price, description, category } = form;
    const priceNum = parseFloat(price);
    if (!name.trim() || !file || !category.trim() || !priceNum) {
      setMsg({ text: 'Name, Price, Image, and Category are required', type: 'error' });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch('http://localhost:3000/api/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.success || !uploadData.imageUrl) {
        throw new Error(uploadData.message || 'Image upload failed.');
      }
      const imageUrl = uploadData.imageUrl;

      const res = await fetch('http://localhost:3000/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), price: priceNum, description: description?.trim() || '', image_url: imageUrl, category: category.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ text: 'Product added successfully!', type: 'success' });
        setForm({ name: '', price: '', description: '', category: '' });
        setFile(null);
        setPreview('');
      } else {
        setMsg({ text: data.message || 'Failed to add product.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error uploading image: ' + (err?.message || ''), type: 'error' });
    }
  }

  const headerStyle = { background: '#1ee6c2', padding: 15, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const inputStyle = { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: '1rem', marginBottom: 12 };

  return (
    <div>
      <header style={headerStyle}>
        <span>Admin Dashboard</span>
        <button onClick={() => { logout(); navigate('/login', { replace: true }); }} style={{ background: '#fff', color: '#1ee6c2', border: 'none', padding: '6px 14px', borderRadius: 6, fontWeight: 'bold' }}>Logout</button>
      </header>

      <div style={{ maxWidth: 510, margin: '40px auto', background: '#fff', padding: 25, borderRadius: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#15846a', marginBottom: 20 }}>Add New Product</h2>
        {msg.text && (
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: msg.type === 'success' ? 'green' : 'red', marginBottom: 10 }}>{msg.text}</div>
        )}
        <form onSubmit={onSubmit}>
          <label style={{ fontWeight: 'bold' }}>Product Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />

          <label style={{ fontWeight: 'bold' }}>Price ($)</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} step="0.01" min="0.01" required style={inputStyle} />

          <label style={{ fontWeight: 'bold' }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} />

          <label style={{ fontWeight: 'bold' }}>Category</label>
          <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={inputStyle} />

          <label style={{ fontWeight: 'bold' }}>Image Upload</label>
          <input type="file" accept="image/*" onChange={onFileChange} required style={inputStyle} />
          {preview && <img src={preview} alt="preview" style={{ display: 'block', maxWidth: '100%', maxHeight: 150, borderRadius: 4, border: '1px solid #e2e2e2', marginBottom: 15 }} />}

          <button type="submit" style={{ background: '#1ee6c2', color: '#fff', border: 'none', width: '100%', padding: 12, borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>Add Product</button>
        </form>
      </div>
    </div>
  );
}
