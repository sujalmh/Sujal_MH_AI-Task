import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadComponent from './components/UploadComponent';
import DownloadResults from './components/DownloadResultsButton';
import ResultsPage from './components/ResultsPage';

function App() {
    const [processingComplete, setProcessingComplete] = useState(false);

    const handleProcessingComplete = () => {
        setProcessingComplete(true);
    };

    return (
        <Router>
            <Routes>
                {/* Upload Page Route */}
                <Route
                    path="/"
                    element={<UploadComponent onProcessingComplete={handleProcessingComplete} />}
                />
                <Route path="/score/:sessionId" element={<ResultsPage />} />
                {/* Download Results Page Route */}
                <Route
                    path="/download-results"
                    element={processingComplete ? <DownloadResults /> : <Navigate to="/" />}
                />
            </Routes>
        </Router>
    );
}

export default App;
