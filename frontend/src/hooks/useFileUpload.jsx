import { useState } from 'react';
import axios from 'axios';

export const useFileUpload = (files) => {
    const [progress, setProgress] = useState({ status: 'idle', completed: 0, total: 0 });
    const [message, setMessage] = useState('');
    
    const uploadFiles = async () => {
        if (files.length === 0) {
            setMessage('Please select a folder first.');
            return;
        }

        setProgress({ ...progress, status: 'uploading', completed: 0, total: files.length });

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await axios.post('http://localhost:5000/upload-folder', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    setProgress((prevProgress) => ({
                        ...prevProgress,
                        completed: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                    }));
                },
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error uploading files');
        }
    };

    const confirmFolder = () => {
        setMessage('Folder confirmed and ready to upload.');
    };

    return {
        progress,
        message,
        uploadFiles,
        confirmFolder
    };
};
