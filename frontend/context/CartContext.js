import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { token, userId } = useContext(AuthContext);
  const storageKey = userId ? `user_cart_quantities_${userId}` : null;

  // Cart is an object map: { [productId: string]: number }
  const [cart, setCart] = useState({});
  const initializedRef = useRef(false);

  // Load cart from localStorage whenever the logged in user changes
  useEffect(() => {
    if (!userId || !storageKey) {
      setCart({});
      return;
    }

    // Migrate and merge any legacy/global cart keys into the current per-user key
    try {
      const merged = {};

      // Current per-user key
      try {
        const cur = JSON.parse(localStorage.getItem(storageKey)) || {};
        if (cur && typeof cur === 'object') Object.assign(merged, cur);
      } catch {}

      // Legacy global key
      try {
        const legacy = JSON.parse(localStorage.getItem('user_cart_quantities')) || {};
        if (legacy && typeof legacy === 'object') Object.assign(merged, legacy);
      } catch {}

      // Any other keys matching prefix
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || k === storageKey) continue;
          if (/^user_cart_quantities(\b|_)/.test(k)) {
            try {
              const data = JSON.parse(localStorage.getItem(k)) || {};
              if (data && typeof data === 'object') Object.assign(merged, data);
            } catch {}
          }
        }
      } catch {}

      // Persist merged to current per-user key and also to legacy key for compatibility
      try { localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
      try { localStorage.setItem('user_cart_quantities', JSON.stringify(merged)); } catch {}

      setCart(merged);
    } catch {
      setCart({});
    }
    initializedRef.current = true;
  }, [userId, storageKey]);

  // Persist cart to localStorage on changes
  useEffect(() => {
    if (!userId || !storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch {}
  }, [cart, userId, storageKey]);

  // Set quantity for a product and sync with backend
  const setQty = useCallback((productId, quantity) => {
    if (!userId) return;

    setCart(prev => {
      const next = { ...prev };
      if (quantity > 0) next[productId] = quantity;
      else delete next[productId];
      // Persist immediately to avoid losing updates on hard navigations
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
        try { localStorage.setItem('user_cart_quantities', JSON.stringify(next)); } catch {}
      }
      return next;
    });

    // Best-effort backend sync (optional; backend may not have these endpoints)
    if (!token) return;
    if (quantity > 0) {
      fetch('http://localhost:3000/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, productId, quantity }),
      }).catch(() => {});
    } else {
      fetch('http://localhost:3000/remove-from-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, productId }),
      }).catch(() => {});
    }
  }, [token, userId, storageKey]);

  // Clear current user's cart (local only)
  const clearCart = useCallback(() => {
    setCart({});
    if (storageKey) {
      try { localStorage.removeItem(storageKey); } catch {}
    }
    try {
      localStorage.removeItem('user_cart_quantities');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && /^user_cart_quantities(\b|_)/.test(k)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }, [storageKey]);

  // Backward-compatible API used by existing screens
  const updateCart = useCallback((updater) => {
    setCart(prev => {
      const next = typeof updater === 'function' ? updater(prev) : (updater || {});
      return next && typeof next === 'object' ? next : {};
    });
  }, []);

  const value = {
    cart,
    setQty,
    clearCart,
    // Legacy method kept for compatibility during migration
    updateCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
