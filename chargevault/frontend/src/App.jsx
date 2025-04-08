
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/signup.jsx';
import Home from './components/home.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
         {/* Default route — redirect to login */}
         <Route path="*" element={<Navigate to="/login" />} />
         
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home />}></Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
