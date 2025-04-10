import React from 'react';
import '../css/Home.css';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();
    return (
        <div className="home-container">
            <div className="center-panel">
                <h2>Home</h2>
                <p>You are signed into:</p>
                <p><strong>Midtown Atlanta Office<br />Building Renovation</strong></p>
                <p>If this is not your construction site<br />
                    <a href="#">click here</a></p>

                <div className="icon-bar">
                    <button style={{fontSize: '32px'}} onClick={() => navigate('/home')}>🏠</button>
                    <button style={{ fontSize: '32px' }} onClick={() => navigate('/reserve')}>🔋</button>
                    <button style={{ fontSize: '32px' }}>🔒</button>

                </div>
            </div>

        </div>
    );
}

export default HomePage;
