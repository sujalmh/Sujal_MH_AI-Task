import React from 'react';

function ProgressStatus({ progress, message }) {
    return (
        <div>
            {message && <p>{message}</p>}
            <p>Status: {progress.status}</p>
            <p>Completed: {progress.completed} / {progress.total}</p>
        </div>
    );
}

export default ProgressStatus;
