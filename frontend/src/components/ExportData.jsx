import React from "react";
import axios from "axios";

const ExportData = () => {
  const handleExport = async () => {
    try {
      const response = await axios.get("http://localhost:5000/export", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "processed_resumes.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Error exporting data");
    }
  };

  return (
    <div>
      <h2>Export Data</h2>
      <button onClick={handleExport}>Download CSV</button>
    </div>
  );
};

export default ExportData;
