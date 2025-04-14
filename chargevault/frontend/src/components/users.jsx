// LoginHistory.jsx
import React, { useEffect, useState } from 'react';
import HomePage from './home';

function LoginHistory() {
    const [logs, setLogs] = useState([]);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if(!storedUsername) {
            console.warn('No useranme found in localStorage.');
            return;
        }
        setUsername(storedUsername);

        fetch(`http://localhost:3001/access_history/${storedUsername}`)
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, [username]);


    return (

        <div>
            <HomePage />
            <h2 style={{textAlign: 'center', fonntSize: '5vw',}}>Access History {username}</h2>
            <ul style={{textAlign: 'center'}}>
                {logs.map((log, idx) => (
                    <li key={idx}>
                        {new Date(log.loginTime).toLocaleString()} - IP: {log.ip}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default LoginHistory;
