// context/AuthContext.js
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const AuthContext = createContext();

function decodeJwt(t) {
  try {
    const base64Url = String(t).split('.')[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  // initialize synchronously from localStorage to avoid transient undefined state
  const [token, setToken] = useState(() => localStorage.getItem('token') ?? null);
  const [userId, setUserId] = useState(() => {
    const u = localStorage.getItem('userId');
    return u !== null ? Number(u) : null;
  });
  const [role, setRole] = useState(() => {
    const t = localStorage.getItem('token');
    const payload = t ? decodeJwt(t) : null;
    return payload?.role ?? localStorage.getItem('role') ?? null;
  });

  const login = useCallback((newToken, newUserId) => {
    const payload = decodeJwt(newToken);
    const newRole = payload?.role ?? null;

    // Persist in localStorage (with backward-compat keys used by some screens)
    localStorage.setItem('token', newToken);
    localStorage.setItem('jwtToken', newToken); // backward-compat
    localStorage.setItem('userId', String(newUserId));
    if (newRole) localStorage.setItem('role', newRole); else localStorage.removeItem('role');

    // React state
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken'); // backward-compat
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setToken(null);
    setUserId(null);
    setRole(null);
  }, []);

  // Keep role in sync if token changes outside of login (e.g., storage restore)
  useEffect(() => {
    const payload = token ? decodeJwt(token) : null;
    const newRole = payload?.role ?? null;
    setRole(prev => (prev !== newRole ? newRole : prev));
    if (newRole) localStorage.setItem('role', newRole); else localStorage.removeItem('role');
  }, [token]);

  const value = useMemo(() => ({ token, userId, role, login, logout }), [token, userId, role, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
