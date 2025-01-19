import React from 'react';
import axios from 'axios';

function FileUploadButton({ onClick }) {
    return (
        <div>
            <button onClick={onClick}>Upload Folder</button>
        </div>
    );
}

export default FileUploadButton;
