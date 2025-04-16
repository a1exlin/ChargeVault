import React, { useEffect, useState } from "react";

function AccessHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/getLogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Access Logs</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Username</th>
              <th style={styles.headerCell}>RFID</th>
              <th style={styles.headerCell}>Location</th>
              <th style={styles.headerCell}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                <td style={styles.cell}>{log.username}</td>
                <td style={styles.cell}>{log.rfid}</td>
                <td style={styles.cell}>{log.location || "—"}</td>
                <td style={styles.cell}>
                  {new Date(log.time * 1000).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "2.5rem",
    marginBottom: "1.5rem",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
  },
  headerRow: {
    backgroundColor: "#0066cc",
    color: "#ffffff",
  },
  headerCell: {
    padding: "14px",
    fontWeight: "bold",
    fontSize: "1rem",
    borderBottom: "2px solid #dddddd",
    textAlign: "center",
  },
  cell: {
    padding: "12px",
    fontSize: "0.95rem",
    borderBottom: "1px solid #eeeeee",
    textAlign: "center",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#ffffff",
  },
};

export default AccessHistory;
