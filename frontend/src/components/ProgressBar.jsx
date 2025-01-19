// src/ProgressBar.jsx
import React, { useEffect, useState } from 'react';

const ProgressBar = () => {
  const [progress, setProgress] = useState({ status: 'idle', completed: 0, total: 0 });

  const fetchProgress = async () => {
    const response = await fetch('/progress');
    const data = await response.json();
    setProgress(data);
  };

  useEffect(() => {
    if (progress.status === 'processing') {
      const interval = setInterval(fetchProgress, 1000);  // Fetch progress every second
      return () => clearInterval(interval);
    }
  }, [progress.status]);

  return (
    <div>
      <h2>Processing Progress</h2>
      <p>Status: {progress.status}</p>
      <p>Completed: {progress.completed} / {progress.total}</p>
      {progress.status === 'processing' && (
        <progress value={progress.completed} max={progress.total}></progress>
      )}
    </div>
  );
};

export default ProgressBar;
