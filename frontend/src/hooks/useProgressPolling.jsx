import { useEffect } from 'react';
import axios from 'axios';

export const useProgressPolling = (progress, setProcessingComplete) => {
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('http://localhost:5000/progress');
                if (response.data.status === 'completed') {
                    setProcessingComplete(true);
                    clearInterval(interval);
                }
            } catch (error) {
                console.error('Error fetching progress', error);
            }
        }, 1000); // Poll every second

        return () => clearInterval(interval); // Clean up the interval on unmount
    }, [progress, setProcessingComplete]);

    return {
        startPolling: () => {},
        stopPolling: () => {},
    };
};
