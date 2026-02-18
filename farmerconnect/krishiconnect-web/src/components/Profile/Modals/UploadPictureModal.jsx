import { useState, useRef } from 'react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPT = 'image/jpeg,image/png,image/webp';

export default function UploadPictureModal({ isOpen, currentImage, onClose, onUpload, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setDragOver(false);
  };

  const validateFile = (f) => {
    setError('');
    if (!f) return false;
    if (!ACCEPT.split(',').some((t) => f.type === t.trim())) {
      setError('Invalid file type. Use JPG, PNG, or WebP');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File exceeds 5MB limit');
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!validateFile(f)) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const handleUpload = () => {
    if (!file) {
      setError('Please select an image');
      return;
    }
    onUpload(file);
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="upload-picture-title">
        <div className="modal-header">
          <h2 id="upload-picture-title" className="modal-title">Update Profile Picture</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <div
            className={`dropzone ${dragOver ? 'drag-over' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="dropzone-input"
              accept={ACCEPT}
              onChange={onFileChange}
              aria-label="Choose image"
            />
            {!preview ? (
              <>
                <div className="dropzone-icon">📷</div>
                <p className="dropzone-text">Drag and drop your image here</p>
                <p className="dropzone-hint">or click to browse</p>
                <p className="dropzone-hint">Max size: 5MB. Formats: JPG, PNG, WebP</p>
              </>
            ) : (
              <>
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
                <div className="preview-info">
                  <div className="preview-filename">{file.name}</div>
                  <div>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary dropzone-browse"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  Change
                </button>
              </>
            )}
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={isLoading || !file}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Uploading...
              </>
            ) : (
              'Upload Picture'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
