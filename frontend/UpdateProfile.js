import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { ProfileContext } from './context/ProfileContext';

export default function UpdateProfile() {
  const { token, userId } = useContext(AuthContext);
  const { profile, setProfile, refreshProfile } = useContext(ProfileContext);
  const [form, setForm] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (profile) {
      setForm({
        id: profile.id || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        password: '',
      });
    }
  }, [profile]);

  if (!token || !userId) {
    return (
      <div style={{ padding: 20 }}>
        <p>You are not logged in. <a href="/login">Go to login</a></p>
      </div>
    );
  }

  function onSubmit(e) {
    e.preventDefault();
    const { id, first_name, last_name, email, password } = form;
    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
      alert('All fields are required.');
      return;
    }
    fetch('http://localhost:3000/update-profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        id, 
        first_name: first_name.trim(), 
        last_name: last_name.trim(), 
        email: email.trim(), 
        password: password.trim() 
      }),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success) {
          alert('Profile updated successfully!');
          // ensure latest data is in context
          const updated = await refreshProfile();
          if (!updated) {
            // fallback to local update
            setProfile({ ...profile, first_name, last_name, email });
          }
          window.location.href = '/welcome';
        } else {
          alert(data.message || 'Update failed.');
        }
      })
      .catch(() => alert('Error updating profile.'));
  }

  const labelStyle = { 
    display: 'block', 
    fontWeight: '600', 
    marginBottom: 6, 
    fontSize: '1rem', 
    textAlign: 'left', 
    color: '#333' 
  };

  const inputStyle = { 
    width: '100%', 
    padding: '12px 14px', 
    border: '1.8px solid #ccc', 
    borderRadius: 8, 
    fontSize: '1rem', 
    marginBottom: 20, 
    boxSizing: 'border-box' 
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1ee6c2 0%, #0896d2 100%)', 
      paddingTop: 60 
    }}>
      <form onSubmit={onSubmit} style={{ 
        background: '#fff', 
        padding: '40px 35px 35px', 
        borderRadius: 12, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
        maxWidth: 400, 
        width: '100%', 
        textAlign: 'center' 
      }}>
        <h1 style={{ 
          marginBottom: 30, 
          fontWeight: 700, 
          fontSize: '2rem', 
          color: '#0896d2' 
        }}>Update Your Profile</h1>
        <input type="hidden" value={form.id} />
        <label style={labelStyle}>First Name:</label>
        <input 
          style={inputStyle} 
          type="text" 
          value={form.first_name} 
          onChange={(e) => setForm({ ...form, first_name: e.target.value })} 
          required 
        />
        <label style={labelStyle}>Last Name:</label>
        <input 
          style={inputStyle} 
          type="text" 
          value={form.last_name} 
          onChange={(e) => setForm({ ...form, last_name: e.target.value })} 
          required 
        />
        <label style={labelStyle}>Email:</label>
        <input 
          style={inputStyle} 
          type="email" 
          value={form.email} 
          onChange={(e) => setForm({ ...form, email: e.target.value })} 
          required 
        />
        <label style={labelStyle}>New Password:</label>
        <input 
          style={inputStyle} 
          type="password" 
          value={form.password} 
          onChange={(e) => setForm({ ...form, password: e.target.value })} 
          required 
        />
        <button 
          type="submit" 
          style={{ 
            backgroundColor: '#0896d2', 
            border: 'none', 
            color: 'white', 
            fontWeight: 700, 
            fontSize: '1.1rem', 
            padding: '12px 0', 
            borderRadius: 8, 
            width: '100%', 
            cursor: 'pointer', 
            marginTop: 10 
          }}>
          Update
        </button>
      </form>
    </div>
  );
}
