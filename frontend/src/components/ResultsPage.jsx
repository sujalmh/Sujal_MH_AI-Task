import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import { FaSort } from "react-icons/fa";

const ResultsPage = () => {
    const { sessionId } = useParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
  
    useEffect(() => {
      const fetchResults = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/results?session_id=${sessionId}`);
          setResults(response.data);
        } catch (err) {
          setError("Failed to fetch results.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchResults();
    }, [sessionId]);
  
    const handleSort = (column) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };
  
    const sortedResults = useMemo(() => {
      if (!sortColumn) return results;
      return [...results].sort((a, b) => {
        const valA = a[sortColumn]?.toString().toLowerCase() || '';
        const valB = b[sortColumn]?.toString().toLowerCase() || '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }, [results, sortColumn, sortDirection]);
  
    const tableHeaderStyle = {
      border: "1px solid #ccc",
      padding: "8px",
      textAlign: "left",
      cursor: "pointer",
    };
  
    const tableCellStyle = {
      border: "1px solid #ccc",
      padding: "8px",
    };
  
    return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", fontSize: "12px"}}>
                <button onClick={() => window.location.href = '/'}>Go back</button>
        <h2>Job Matching Results</h2>
        {loading ? (
          <p>Loading results...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th style={tableHeaderStyle} onClick={() => handleSort('file_name')}>File Name <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('name')}>Name <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('contact_details')}>Contact Details <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('university')}>University <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('expected_year_of_completion')}>Expected Year <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('course')}>Course <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('discipline')}>Discipline <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('cgpa')}>CGPA <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('key_skills')}>Key Skills <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('ai_ml_score')}>AI/ML Score <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('gen_ai_score')}>Gen AI Score <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('projects')}>Projects <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('internships')}>Internships <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('certifications')}>Certifications <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('role_match')}>Role Match <FaSort />
</th>
                <th style={tableHeaderStyle} onClick={() => handleSort('career')}>Inferred Career <FaSort />
</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((result, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{result.file_name}</td>
                  <td style={tableCellStyle}>{result.name}</td>
                  <td style={tableCellStyle}>{result.contact_details}</td>
                  <td style={tableCellStyle}>{result.university}</td>
                  <td style={tableCellStyle}>{result.expected_year_of_completion}</td>
                  <td style={tableCellStyle}>{result.course}</td>
                  <td style={tableCellStyle}>{result.discipline}</td>
                  <td style={tableCellStyle}>{result.cgpa}</td>
                  <td style={tableCellStyle}>{result.key_skills}</td>
                  <td style={tableCellStyle}>{result.ai_ml_score}</td>
                  <td style={tableCellStyle}>{result.gen_ai_score}</td>
                  <td style={tableCellStyle}>{result.projects}</td>
                  <td style={tableCellStyle}>{result.internships}</td>
                  <td style={tableCellStyle}>{result.certifications}</td>
                  <td style={tableCellStyle}>{result.role_match}</td>
                  <td style={tableCellStyle}>{result.career}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  
  export default ResultsPage;
  