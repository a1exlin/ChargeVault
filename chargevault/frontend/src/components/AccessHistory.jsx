import React, { useEffect, useState } from 'react';

function AccessHistory() {
    const [logs, setLogs] = useState([]);
    const username = localStorage.getItem('username');

    useEffect(() => {

        fetch(`http://localhost:3001/access_history/${username}`)
            .then(res => res.json())
            .then(data => setLogs(data))
            .catch(err => console.error(err));
    }, [username]);


    return (

        <div>

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

export default AccessHistory;
