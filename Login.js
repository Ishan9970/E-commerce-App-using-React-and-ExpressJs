import React, { useState } from "react";

export default function Login() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter email and password");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("role", role);
        if (data.id) {
          localStorage.setItem("userId", data.id);
        } else {
          try {
            const payload = JSON.parse(atob(data.token.split(".")[1]));
            if (payload.id) localStorage.setItem("userId", payload.id);
          } catch {
            console.warn("Could not decode userId from token");
          }
        }
        if (role === "admin") {
          window.location.href = "/admin_dashboard";
        } else {
          window.location.href = "/welcome";
        }
      } else {
        setErrorMsg(data.message || "Login failed.");
      }
    } catch {
      setErrorMsg("Error during login.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Website</h1>
      <div style={styles.loginBox}>
        <h2>Log in to website</h2>
        <div style={styles.errorMsg}>{errorMsg}</div>
        <form id="loginForm" onSubmit={handleSubmit} noValidate>
          <div style={styles.roleSelect}>
            <label>
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              Log in as User
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              Log in as Admin
            </label>
          </div>
          <input
            type="text"
            id="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <br />
          <input
            type="password"
            id="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <br />
          <br />
          <input type="submit" value="Log In" style={styles.submitButton} />
          <br />
          <br />
        </form>
        <a href="/reset" style={styles.link}>
          Forgotten Password?
        </a>
        <hr style={styles.hr} />
        <input
          type="button"
          value="Create Account"
          onClick={() => (window.location.href = "/signup")}
          style={styles.createButton}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: 100,
    fontFamily: "Arial, sans-serif",
    background: "#f0f4f8",
    minHeight: "100vh",
    padding: "20px",
  },
  title: {
    color: "blue",
    marginBottom: "1rem",
  },
  loginBox: {
    border: "1px solid #ccc",
    borderRadius: 10,
    padding: "30px 25px",
    width: 350,
    margin: "0 auto",
    background: "#fff",
  },
  errorMsg: {
    color: "red",
    marginBottom: 10,
    minHeight: 18,
  },
  roleSelect: {
    marginBottom: 15,
    textAlign: "left",
    paddingLeft: 10,
  },
  input: {
    height: 30,
    borderRadius: 8,
    border: "1px solid #ccc",
    width: "90%",
    paddingLeft: 8,
    marginBottom: 15,
    fontSize: "1rem",
  },
  submitButton: {
    borderRadius: 8,
    border: "1px solid #ccc",
    width: 250,
    height: 35,
    fontSize: "1rem",
    backgroundColor: "lightblue",
    cursor: "pointer",
  },
  createButton: {
    borderRadius: 8,
    border: "1px solid #ccc",
    width: 200,
    height: 35,
    fontSize: "1rem",
    backgroundColor: "green",
    color: "white",
    cursor: "pointer",
    marginTop: 15,
  },
  link: {
    color: "blue",
    textDecoration: "none",
    display: "block",
    marginTop: 15,
  },
  hr: {
    marginTop: 15,
    marginBottom: 15,
  },
};
