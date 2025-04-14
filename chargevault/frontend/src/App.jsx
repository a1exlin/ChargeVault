
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/signup.jsx';
import Home from './components/home.jsx';
import SlotList from './components/getSlots.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
         {/* Default route — redirect to login */}
         <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<Home />}></Route>
        <Route path='/slots' element={<SlotList/>}></Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;
