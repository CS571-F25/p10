import React, { useState } from "react";
import { useNavigate } from "react-router";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleRegister() {
    if (!username || !password) {
      setMessage("Please fill out both fields.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username]) {
      setMessage("Account already exists.");
      return;
    }

    users[username] = password;
    localStorage.setItem("users", JSON.stringify(users));
    setMessage("Registered! You can now login.");
  }

  function handleLogin() {
    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username] && users[username] === password) {
      setMessage("Login successful!");
      localStorage.setItem("username", username);
      setTimeout(() => navigate("/home"), 800);
    } else {
      setMessage("Invalid username or password.");
    }
  }
//Got help from ChatGPT
  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <label className="input-label">Email</label>
        <div className="input-wrapper">
          <input
            type="text"
            className="login-input"
            value={username}
            placeholder="Enter email"
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="input-icon">📧</span>
        </div>

        <label className="input-label">Password</label>
        <div className="input-wrapper">
          <input
            type="password"
            className="login-input"
            value={password}
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="input-icon">🔒</span>
        </div>
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        {message && <p className="login-message">{message}</p>}
        <div className="login-links">
          <span onClick={handleRegister}>Create an account</span>
        </div>
      </div>
    </div>
  );
}
