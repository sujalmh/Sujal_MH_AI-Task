import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    padding: "10px 20px",
    color: "white",
    fontFamily: "Arial, sans-serif",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    margin: "0 10px",
    fontSize: "16px",
  };

  const navLinksStyle = {
    display: "flex",
    listStyleType: "none",
    padding: 0,
  };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/" style={{ ...linkStyle, fontSize: "20px", fontWeight: "bold" }}>
          Generative AI-Powered Resume Analyzer
        </Link>
      </div>
      <ul style={navLinksStyle}>
        <li>
          <Link to="/" style={linkStyle}> Home </Link>
          <Link to="/history" style={linkStyle}>
            History
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;