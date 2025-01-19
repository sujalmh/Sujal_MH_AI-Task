import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadComponent from './components/UploadComponent';
import ResultsPage from './components/ResultsPage';
import Navbar from './components/Navbar';
import HistoryPage from './components/HistoryPage';
function App() {
    const [processingComplete, setProcessingComplete] = useState(false);

    const handleProcessingComplete = () => {
        setProcessingComplete(true);
    };

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route
                    path="/"
                    element={<UploadComponent onProcessingComplete={handleProcessingComplete} />}
                />
                <Route path="/score/:sessionId" element={<ResultsPage />} />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </Router>
    );
}

export default App;
