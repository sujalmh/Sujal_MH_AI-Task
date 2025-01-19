import axios from 'axios';

export const uploadFilesToServer = async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    return await axios.post('http://localhost:5000/upload-folder', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getProgress = async () => {
    return await axios.get('http://localhost:5000/progress');
};

export const exportData = async () => {
    return await axios.get('http://localhost:5000/export', { responseType: 'blob' });
};
