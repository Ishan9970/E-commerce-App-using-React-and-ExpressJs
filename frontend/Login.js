import React, { useState, useContext } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthContext } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (role === "admin" && response.status === 401) {
          setErrorMsg("You are not admin; login as user.");
        } else {
          setErrorMsg(data.message || "Login failed.");
        }
        return;
      }

      // Accept common backend response shapes for token; userId may be inside JWT payload per backend
      const token = data.token ?? data.accessToken ?? data.access_token ?? data.jwt ?? data.authToken ?? data?.data?.token ?? data?.result?.token;
      let userId = (data.userId ?? data.id ?? data?.user?.id ?? data?.user?.userId ?? data?.user_id ?? data?.data?.userId ?? data?.result?.userId);

      if (token && (userId == null)) {
        const payload = decodeJwt(token);
        userId = payload?.id ?? payload?.userId ?? payload?.sub ?? null;
      }

      if (token && userId != null) {
        login(token, Number(userId));
        const payloadRole = decodeJwt(token)?.role;
        const finalRole = payloadRole ?? role;
        navigate(finalRole === 'admin' ? '/admin' : '/welcome', { replace: true });
        return;
      }

      console.warn('Unrecognized login response shape:', data);
      setErrorMsg(data.message || "Invalid login response.");
    } catch (err) {
      setErrorMsg("Error during login.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-11 col-sm-8 col-md-5 col-lg-4">
        <div className="card shadow-lg gradient-card p-4">
          <h1 className="text-center text-primary mb-4 display-5 fw-bold border-bottom pb-2">Website</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Login as:</label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    id="userRole"
                  />
                  <label className="form-check-label" htmlFor="userRole">User</label>
                </div>
                <div className="form-check form-check-inline ms-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    id="adminRole"
                  />
                  <label className="form-check-label" htmlFor="adminRole">Admin</label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 rounded-pill fs-5" style={{ letterSpacing: "1px" }}>
              <i className="bi bi-box-arrow-in-right me-2"></i> Log In
            </button>
          </form>
          {errorMsg && (
            <div className="alert alert-danger text-center mt-3 rounded-pill">
              {errorMsg}
            </div>
          )}
          <hr />
          <button
            className="btn btn-outline-secondary w-100 rounded-pill mt-3"
            onClick={() => (window.location.href = "signup")}
          >
            Create Account
          </button>
          <a href="reset" className="btn btn-link w-100 mt-3 text-center">Forgotten Password?</a>
        </div>
      </div>
    </div>
  );
}

