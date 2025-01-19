import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/history");
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch session history.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p>Loading history...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const tableHeaderStyle = {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "left"
  };

  const tableCellStyle = {
    border: "1px solid #ccc",
    padding: "8px"
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Session History</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={tableHeaderStyle}> Session ID</th>
            <th style={tableHeaderStyle}>Created At</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, index) => (
            <tr key={index}>
              <td style={tableCellStyle}><Link to={`/score/${entry.session_id}`}>{entry.session_id}</Link></td>
              <td style={tableCellStyle}>{entry.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
