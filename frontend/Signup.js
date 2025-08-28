import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Signup successful! Redirecting to login...");
        setFormData({ first_name: "", last_name: "", email: "", password: "" });
        setTimeout(() => {
          window.location.href = "login";
        }, 1500);
      } else {
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        <div className="card shadow-lg p-4" style={{ borderRadius: 20, background: 'linear-gradient(120deg, #fff 50%, #f3f7fa 100%)', boxShadow: '0 8px 32px 0 rgba(0,93,179,0.2)' }}>
          <h1 className="text-center text-primary mb-4 display-5 fw-bold border-bottom pb-2">Create Account</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="first_name" className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                id="first_name"
                name="first_name"
                placeholder="Your first name"
                required
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="last_name" className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="last_name"
                name="last_name"
                placeholder="Your last name"
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Create a password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 rounded-pill fs-5" style={{ letterSpacing: "1px" }}>Sign Up</button>
          </form>
          {message && (
            <div className="alert alert-success text-center mt-3 rounded-pill">
              {message}
            </div>
          )}
          <button
            className="btn btn-outline-secondary w-100 rounded-pill mt-3"
            onClick={() => (window.location.href = "login")}
          >
            Already have an account? <span className="fw-bold">Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
