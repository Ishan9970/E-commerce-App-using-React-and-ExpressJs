import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token, role, logout } = useContext(AuthContext);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [token, role, navigate]);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    gap: 25,
    flexWrap: 'wrap',
  };
  const cardStyle = {
    background: 'white',
    width: 220,
    height: 150,
    borderRadius: 12,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    cursor: 'pointer',
  };
  const headerStyle = {
    background: 'linear-gradient(to right, #1ee6c2, #0fc4a0)',
    color: '#fff',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div>
      <header style={headerStyle}>
        <span style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>Admin Dashboard</span>
        <button
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
          style={{ background: '#fff', color: '#0fc4a0', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}
        >
          Logout
        </button>
      </header>

      <div style={containerStyle}>
        <div style={cardStyle} onClick={() => navigate('/insert_product')}>
          <div style={{ fontSize: 32 }}>🛒</div>
          <h3 style={{ color: '#0fc4a0', marginTop: 10 }}>Insert Product</h3>
        </div>
        <div style={cardStyle} onClick={() => navigate('/delete_product')}>
          <div style={{ fontSize: 32 }}>❌</div>
          <h3 style={{ color: '#0fc4a0', marginTop: 10 }}>Delete Product</h3>
        </div>
        <div style={cardStyle} onClick={() => navigate('/update_product')}>
          <div style={{ fontSize: 32 }}>✏️</div>
          <h3 style={{ color: '#0fc4a0', marginTop: 10 }}>Update Product</h3>
        </div>
      </div>
    </div>
  );
}
