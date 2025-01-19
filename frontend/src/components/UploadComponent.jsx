import React, { useState } from 'react';
import axios from 'axios';
import '../assets/css/UploadPage.css';
import { Link } from "react-router-dom";
import { MdPending, MdCheckCircle, MdDownload, MdOutlineReplay, MdArrowForward, MdCloudUpload  } from "react-icons/md";
import { GrScorecard } from "react-icons/gr";

function UploadComponent() {
    const [jobDescriptionNeeded, setJobDescriptionNeeded] = useState(false);
    const [useGitHub, setUseGitHub] = useState(false);
    const [files, setFiles] = useState([]);
    const [progress, setProgress] = useState({
        status: 'idle',
        completed: 0,
        total: 0,
        uploadingCompleted: false,
        processingCompleted: false,
    });
    const [message, setMessage] = useState('');
    const [folderConfirmed, setFolderConfirmed] = useState(false);
    const [processingComplete, setProcessingComplete] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [jobDescription, setJobDescription] = useState('');

    const handleFolderSelection = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles);
            setFolderConfirmed(false);
            setMessage('Files selected. Confirm folder to upload.');
        }
    };

    const handleConfirmFolder = () => {
        
        if (files.length === 0 || (jobDescriptionNeeded && jobDescription === "")) {
            console.log(files.length, jobDescription);
            if (files.length === 0) {
                setMessage('Please select a folder.');
            }
            if (jobDescriptionNeeded && jobDescription === "") {
                setMessage('Please enter a job description.');
            }
        } else {
            setFolderConfirmed(true);
            setMessage('Folder selected. Ready to upload.');
        }
    };

    const handleFolderUpload = async () => {
        if (!folderConfirmed) {
            setMessage('Please confirm the folder first.');
            return;
        }

        setProgress({ ...progress, status: 'uploading', completed: 0, total: files.length, uploadingCompleted: false, processingCompleted: false });
        setUploading(true);

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        if (jobDescriptionNeeded) {
            formData.append('jobDescription', jobDescription);
        }
        formData.append('useGitHub', useGitHub);
        try {
            const response = await axios.post('http://localhost:5000/upload-folder', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    setProgress((prevProgress) => ({
                        ...prevProgress,
                        completed: Math.round((progressEvent.loaded) / progressEvent.total),
                    }));
                },
            });
            setMessage(response.data.message);
            setSessionId(response.data.session_id);
            startProgressPolling();
        } catch (error) {
            setMessage('Error uploading files');
        }
    };

    const startProgressPolling = () => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('http://localhost:5000/progress', {
                    params: { session_id: sessionId }
                });
                setProgress(response.data);
                if (response.data.status === 'completed') {
                    setProcessingComplete(true);
                    setUploading(false);
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error fetching progress', error);
            }
        }, 1000);
    };

    const downloadCSV = async () => {
        if (!sessionId) {
            setMessage('No session to download results from');
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/export?session_id=${sessionId}`, { responseType: 'blob' });
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

    const resetProcess = () => {
        setProgress({
            status: 'idle',
            completed: 0,
            total: 0,
            uploadingCompleted: false,
            processingCompleted: false
        });
        setMessage('');
        setFolderConfirmed(false);
        setProcessingComplete(false);
        setFiles([]);
        setUploading(false);
        setSessionId(null);
        setJobDescription('');
        setJobDescriptionNeeded(false);
        setUseGitHub(false);
        const fileInput = document.getElementById('folderInput');
            if (fileInput) {
                fileInput.value = null;
        }
        const jobDescriptionInput = document.getElementById('jobDescription');
        if (jobDescriptionInput) {
            jobDescriptionInput.value = '';
        }
    };

    return (
        <div className="upload-container">
            <h2 className="title">Generative AI-Powered Resume Analyzer</h2>

            <div className="upload-section">
                <label>Resume Folder:</label>
                <input
                    type="file"
                    webkitdirectory="true"
                    mozdirectory="true"
                    onChange={handleFolderSelection}
                    multiple
                    className="file-input"
                    id="folderInput"
                />
                <label>
                    <input
                    type="checkbox"
                    checked={jobDescriptionNeeded}
                    onChange={(e) => setJobDescriptionNeeded(e.target.checked)}
                    id='jobDescriptionNeededInput'
                    />
                    Is job description needed?
                </label>
                <label>
                    <input
                    type="checkbox"
                    checked={useGitHub}
                    onChange={(e) => setUseGitHub(e.target.checked)}
                    id='useGitHubInput'
                    />
                    Analyse GitHub? (takes more time)
                </label>

                {jobDescriptionNeeded && (
                    <>
                    <label>Job Description:</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        id="jobDescription"
                        placeholder="Enter job description..."
                        rows={10}
                    />
                    </>
                )}
                {!folderConfirmed && (
                    <button onClick={handleConfirmFolder} className="btn confirm-btn">
                        <MdArrowForward />Confirm Folder
                    </button>
                )}
                
                {!progress.uploadingCompleted && folderConfirmed && !uploading && (
                    <button onClick={handleFolderUpload} className="btn upload-btn">
                        <MdCloudUpload />Analyse Resumes
                    </button>
                )}
            </div>

            {/* Status */}
            <div className="status-section">
                {message && <p className="status-message">{message}</p>}
            </div>

            {files.length > 0 && (
                <table className="status-section">
                    <tbody>
                        <tr>
                            
                            <th>Uploading Status</th>
                            <td>{progress.uploadingCompleted ? <MdCheckCircle id='completed-icon'/> : <MdPending id='pending-icon'/>}</td>
                            <td>{progress.uploadingCompleted ? 'Complete' : 'Pending'}</td>
                        </tr>
                        <tr>
                            
                            <th>Processing Status</th>
                            <td>{progress.processingCompleted ? <MdCheckCircle id='completed-icon'/> : <MdPending id='pending-icon'/>}</td>
                            <td>{progress.processingCompleted ? 'Complete' : 'Pending'}</td>
                        </tr>
                    </tbody>
                </table>
            )}

            {progress.status !== 'idle' && !processingComplete && (
                <div className="progress-section">
                    <p>Status: {progress.status}</p>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        />
                    </div>
                    <p>{progress.completed} / {progress.total} files processed</p>
                </div>
            )}

            {processingComplete && (
                <div className="download-section">
                    <p>Processing complete. Download the results.</p>
                    <button onClick={downloadCSV} className="btn download-btn">
                        <MdDownload id='downloadBtn'/> Download Results
                    </button>
                </div>
            )}
            {processingComplete && (
                <div className="results-section">
                    <button className="btn results-btn">
                        <Link to={`/score/${sessionId}`}><GrScorecard id='ResultsBtn'/> View Results</Link>
                    </button>
                </div>
            )}

            {processingComplete && (
                <div className="reset-section">
                    <button onClick={resetProcess} className="btn reset-btn">
                        <MdOutlineReplay id='startOverBtn'/>Start Over
                    </button>
                </div>
            )}
        </div>
    );
}

export default UploadComponent;
