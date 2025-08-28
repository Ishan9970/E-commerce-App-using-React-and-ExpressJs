import React, { useEffect, useState, useCallback, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from './context/AuthContext';
import { CartContext } from './context/CartContext';
import { ProfileContext } from './context/ProfileContext';

export default function Welcome() {
  const { token, userId, logout } = useContext(AuthContext);
  const { cart, setQty } = useContext(CartContext);
  const { profile } = useContext(ProfileContext);

  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  const profileInitials = ((profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '')).toUpperCase() || '--';

  const loadProducts = useCallback(
    (category) => {
      fetch(`http://localhost:3000/api/products-by-category?category=${encodeURIComponent(category)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((products) => {
          if (!Array.isArray(products)) {
            setProducts([]);
            return;
          }
          setProducts(products);
        })
        .catch(() => setProducts([]));
    },
    [token],
  );

  useEffect(() => {
    if (!token || !userId) {
      logout();
      window.location.href = '/login';
      return;
    }

    fetch(`http://localhost:3000/api/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((cats) => setCategories(['All', ...cats]))
      .catch(console.error);
  }, [token, userId, logout]);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory, loadProducts]);

  function setProductQty(pid, qty) {
    setQty(String(pid), Math.max(0, qty));
  }

  function handleDeleteAccount() {
    if (!window.confirm('Are you sure?')) return;
    fetch('http://localhost:3000/delete-myself', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          alert('Your account has been deleted.');
          logout();
          window.location.href = '/login';
        } else {
          alert(result.message || 'Could not delete.');
        }
      })
      .catch(() => alert('Server error.'));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = e.target.query.value.trim();
    if (!query) return;
    fetch(`http://localhost:3000/search?query=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw res;
        return res.json();
      })
      .then((data) => {
        if (data.productId) {
          window.location.href = `/product_details?id=${data.productId}`;
        } else {
          alert('No matching product found.');
        }
      })
      .catch(() => {
        alert('Search error.');
      });
  }

  return (
    <div
      className="container py-4"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1ee6c2 0%, #0896d2 100%)',
        color: '#242b3a',
      }}
    >
      <nav
        className="navbar d-flex justify-content-between align-items-center mb-4 p-3 rounded"
        style={{ backgroundColor: 'rgba(41, 64, 95, 0.5)', boxShadow: '0 2px 16px rgba(0, 0, 0, 0.07)' }}
      >
        <span
          className="brand text-white"
          style={{
            fontSize: '1.6rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.12)',
            whiteSpace: 'nowrap',
          }}
        >
          Welcome
        </span>

        <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-center">
          <select
            id="categoryFilter"
            className="form-select"
            style={{
              maxWidth: '150px',
              borderRadius: '0.7em',
              fontWeight: 600,
              color: '#0896d2',
              boxShadow: '0 3px 8px #1ee6c220',
              backgroundColor: '#f6fcfe',
              border: 'none',
            }}
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <form
            className="d-flex flex-grow-1"
            style={{
              maxWidth: '400px',
              backgroundColor: '#fff',
              borderRadius: '1.2em',
              boxShadow: '0 6px 24px rgba(30, 125, 134, 0.09)',
              overflow: 'hidden',
            }}
            onSubmit={handleSearchSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              name="query"
              placeholder="Search for item.."
              required
              className="form-control border-0"
              style={{ paddingLeft: '20px' }}
            />
            <button type="submit" className="btn btn-info" style={{ padding: '0 22px', borderRadius: '0', fontWeight: 600 }}>
              Search
            </button>
          </form>
        </div>

        <div className="d-flex align-items-center position-relative" style={{ gap: '1rem' }}>
          <a
            className="cart-icon"
            role="button"
            title="View Cart"
            href="/cart"
            style={{ color: '#fff', fontSize: '1.5rem', cursor: 'pointer', textDecoration: 'none' }}
          >
            &#128722;
          </a>

          <div
            className="profile-circle text-center text-info fw-bold"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#fff',
              borderRadius: '50%',
              lineHeight: '44px',
              border: '2px solid #1ee6c2',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.11)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {profileInitials}
          </div>

          <div
            id="dropdownMenu"
            className="dropdown-menu p-0"
            style={{
              position: 'absolute',
              top: '56px',
              right: 0,
              minWidth: '140px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 12px 48px #1ee6c23d',
              border: '1px solid #e1e5e9cc',
              display: menuOpen ? 'flex' : 'none',
              flexDirection: 'column',
              zIndex: 110,
            }}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              className="dropdown-item fw-semibold"
              onClick={() => (window.location.href = '/profile')}
              style={{ cursor: 'pointer' }}
            >
              Profile
            </button>
            <button
              className="dropdown-item fw-semibold"
              onClick={() => (window.location.href = '/update_profile')}
              style={{ cursor: 'pointer' }}
            >
              Update
            </button>
            <button
              className="dropdown-item text-danger fw-semibold"
              onClick={handleDeleteAccount}
              style={{ cursor: 'pointer' }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </nav>

      <div>
        {products.length === 0 ? (
          <p className="text-white fs-5 text-center mt-5">No products available</p>
        ) : (
          <div className="row g-4">
            {products.map((product) => (
              <div key={product.id} className="col-12 col-sm-6 col-md-6 col-lg-3 d-flex">
                <div
                  className="card text-center flex-grow-1"
                  onClick={() => (window.location.href = `/product_details?id=${product.id}`)}
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: '14px',
                    background: '#fff',
                    boxShadow: hoveredId === product.id ? '0 10px 24px rgba(0, 0, 0, .18)' : '0 4px 18px rgba(0, 0, 0, .12)',
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    transform: hoveredId === product.id ? 'translateY(-4px) scale(1.02)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '160px',
                      width: '100%',
                    }}
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '140px',
                        objectFit: 'contain',
                        margin: 'auto',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <h2 className="fs-5 mt-2">{product.name}</h2>
                  <p className="price text-muted fs-4">${Number(product.price).toFixed(2)}</p>
                  <div className="card-actions px-3 mb-3">
                    {cart[product.id] > 0 ? (
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => { e.stopPropagation(); setProductQty(product.id, cart[product.id] - 1); }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '2em', textAlign: 'center' }}>{cart[product.id]}</span>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={(e) => { e.stopPropagation(); setProductQty(product.id, cart[product.id] + 1); }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-primary w-100" onClick={(e) => { e.stopPropagation(); setProductQty(product.id, 1); }}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
