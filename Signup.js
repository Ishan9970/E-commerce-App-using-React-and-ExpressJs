import React, { useState } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Signup successful! Redirecting to login...");
        setFormData({ first_name: "", last_name: "", email: "", password: "" });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        setMessage(data.message || "Signup failed.");
      }
    } catch (err) {
      setMessage("Error connecting to server.");
      console.error(err);
    }
  };

  return (
    <div style={styles.signupContainer}>
      <h1 style={styles.heading}>Create Account</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="first_name" style={styles.label}>First Name</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          placeholder="Your first name"
          required
          value={formData.first_name}
          onChange={handleChange}
          style={styles.input}
        />
        <label htmlFor="last_name" style={styles.label}>Last Name</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          placeholder="Your last name"
          required
          value={formData.last_name}
          onChange={handleChange}
          style={styles.input}
        />
        <label htmlFor="email" style={styles.label}>Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="your.email@example.com"
          required
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />
        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Create a password"
          required
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />
        <button type="submit" style={styles.submitButton}>Sign Up</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  signupContainer: {
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    maxWidth: "400px",
    margin: "40px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
  },
  heading: {
    color: "#007acc",
    fontWeight: "700",
    fontSize: "2rem",
    marginBottom: "25px",
    textAlign: "center"
  },
  label: {
    fontWeight: "600",
    marginBottom: "6px",
    display: "block"
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1.5px solid #ccc",
    fontSize: "1rem",
    outline: "none"
  },
  submitButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007acc",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "1.1rem",
    cursor: "pointer"
  },
  message: {
    marginTop: "20px",
    textAlign: "center",
    fontWeight: "600",
    color: "green"
  }
};
