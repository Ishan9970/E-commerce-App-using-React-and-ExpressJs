import React, { useContext, useMemo } from 'react';
import { AuthContext } from './context/AuthContext';
import { ProfileContext } from './context/ProfileContext';

export default function Profile() {
  const { logout } = useContext(AuthContext);
  const { profile } = useContext(ProfileContext);

  const initials = useMemo(() => (
    ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')).toUpperCase() || '--'
  ), [profile]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1ee6c2 0%, #0896d2 100%)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(41, 64, 95, 0.50)', padding: '16px 32px', color: '#fff' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Website</div>
        <div style={{
          width: 44,
          height: 44,
          background: '#fff',
          color: '#20a39e',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          border: '2px solid #1ee6c2'
        }}>{initials}</div>
      </nav>
      <div style={{ maxWidth: 400, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', borderRadius: 12, margin: '3rem auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: '#0896d2', marginTop: 0 }}>User Profile</h1>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontWeight: 600, color: '#555', marginBottom: 6 }}>First Name:</div>
          <div style={{ fontSize: '1.1rem', background: '#f7f9fb', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #e1e5e9' }}>{profile?.first_name || ''}</div>
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontWeight: 600, color: '#555', marginBottom: 6 }}>Last Name:</div>
          <div style={{ fontSize: '1.1rem', background: '#f7f9fb', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #e1e5e9' }}>{profile?.last_name || ''}</div>
        </div>
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontWeight: 600, color: '#555', marginBottom: 6 }}>Email:</div>
          <div style={{ fontSize: '1.1rem', background: '#f7f9fb', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #e1e5e9' }}>{profile?.email || ''}</div>
        </div>
        <button onClick={() => { logout(); window.location.href = '/login'; }} style={{ marginTop: '1rem', background: '#0896d2', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', width: '100%' }}>Log Out</button>
      </div>
    </div>
  );
}
