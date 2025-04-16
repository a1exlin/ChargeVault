import React, { useEffect } from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";
import { checkToken } from "./utils/auth";
import Logo from './imgs/logo.PNG';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
      const runTokenCheck = async () => {
        const isValid = await checkToken();
        if (!isValid) {
          navigate("/login");
        }
      };
  
      runTokenCheck();
    }, [navigate]);

    return (
        <div className="home-container">
          
            <div className="center-panel">
            <img src={Logo} alt="ChargeVault Logo" className='logo'></img>
                <h2>Home</h2>
                <p>You are signed into:</p>
                <p><strong>Midtown Atlanta Office<br />Building Renovation</strong></p>
                <p>If this is not your construction site<br />
                    <a href="#home">click here</a></p>

                <div className="icon-bar">
                    <button style={{fontSize: '32px'}} onClick={() => navigate('/home')}>🏠</button>
                    <button style={{ fontSize: '32px' }} onClick={() => navigate('/slots')}>🔋</button>
                    <button style={{ fontSize: '32px' }} onClick={()=> navigate('/access_history')}>🔒</button>

                </div>
                
            </div>

      </div>
  );
}

export default HomePage;
