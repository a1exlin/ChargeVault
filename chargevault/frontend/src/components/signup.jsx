import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/Signup.css';
import axios from 'axios';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.json();
  
      if (res.status === 201) {
        alert('Account created!');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('An error occurred during signup.');
    }
  };
  
  

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
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
        <button type="submit">Create Account</button>
        <p className="login-text">Already have an account?</p>
        <Link to="/login" className="loginbutton">Login</Link>
      </form>
    </div>
  );
}

export default SignupPage;
