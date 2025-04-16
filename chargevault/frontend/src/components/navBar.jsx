import React from "react";
import { useNavigate } from "react-router-dom";

function NavBar() {
  const navigate = useNavigate();

  return (
    <div>
      <div
        className="NavBarComp"
        style={{
          height: "50px",
        }}
      ></div>

      <div
        className="navBar"
        style={{
          maxHeight: "50px",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#222",
          padding: "8px 12px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "10px", // space between icons
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <button
          style={{
            fontSize: "20px",
            background: "none",
            color: "white",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
          onClick={() => navigate("/home")}
        >
          🏠
        </button>
        <button
          style={{
            fontSize: "20px",
            background: "none",
            color: "white",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
          onClick={() => navigate("/slots")}
        >
          🔋
        </button>
        <button
          style={{
            fontSize: "20px",
            background: "none",
            color: "white",
            border: "none",
            cursor: "pointer",
            padding: "4px",
          }}
          onClick={() => navigate("/access_history")}
        >
          🔒
        </button>
      </div>
    </div>
  );
}

export default NavBar;
