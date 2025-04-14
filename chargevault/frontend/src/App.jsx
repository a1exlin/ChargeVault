import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/signup.jsx";
import Home from "./components/home.jsx";
import SlotList from "./components/getSlots.jsx";
import UserPage from "./components/users.jsx";
import NavBar from "./components/navBar.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route — redirect to login */}
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/home"
          element={
            <div>
              <NavBar /> <Home />
            </div>
          }
        ></Route>
        <Route
          path="/slots"
          element={
            <div>
              <NavBar />
              <SlotList />
            </div>
          }
        ></Route>
        <Route
          path="/access_history"
          element={
            <div>
              <NavBar />
              <UserPage />
            </div>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
