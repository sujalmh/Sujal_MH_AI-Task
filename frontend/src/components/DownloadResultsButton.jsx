import React from 'react';
import axios from 'axios';

function DownloadResultsButton() {
    const downloadCSV = async () => {
        try {
            const response = await axios.get('http://localhost:5000/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'processed_resumes.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading CSV', error);
        }
    };

    return (
        <div>
            <button onClick={downloadCSV}>Download Results</button>
        </div>
    );
}

export default DownloadResultsButton;