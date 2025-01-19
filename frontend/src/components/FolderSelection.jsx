import React from 'react';

function FolderSelection({ handleFolderSelection }) {
    return (
        <div>
            <input
                type="file"
                webkitdirectory="true"
                mozdirectory="true"
                onChange={handleFolderSelection}
                multiple
            />
        </div>
    );
}

export default FolderSelection;