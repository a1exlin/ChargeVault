import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css"; // adjust path if needed
import { checkToken } from "./utils/auth";

const LoginPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  if(checkToken()) {
    navigate("/home");
  }


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(""); // clear old errors

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.message === "Success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        navigate("/home");
      } else {
        setLoginError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("A network error occurred during login.");
    }
  };

  

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>CHARGEVault</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>

        {loginError && <div className="error-text">{loginError}</div>}

        <p className="signup-text">
          Don’t have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
