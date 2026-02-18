import { useState, useEffect } from 'react';

const MAX_BIO_LENGTH = 500;

export default function EditBioModal({ isOpen, currentBio = '', onClose, onSave, isLoading }) {
  const [bio, setBio] = useState(currentBio);
  const [error, setError] = useState('');

  useEffect(() => {
    setBio(currentBio);
    setError('');
  }, [currentBio, isOpen]);

  const length = bio.length;
  const isOverLimit = length > MAX_BIO_LENGTH;
  const charCountClass = length > MAX_BIO_LENGTH ? 'danger' : length >= MAX_BIO_LENGTH * 0.8 ? 'warning' : '';

  const handleSave = () => {
    setError('');
    if (isOverLimit) {
      setError(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`);
      return;
    }
    onSave(bio.trim());
  };

  const handleClear = () => {
    if (window.confirm('Clear bio? This cannot be undone.')) {
      onSave('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-bio-title">
        <div className="modal-header">
          <h2 id="edit-bio-title" className="modal-title">Edit Your Bio</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <textarea
            className="bio-textarea"
            placeholder="Tell us about yourself!"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={MAX_BIO_LENGTH + 1}
            disabled={isLoading}
            aria-label="Bio"
          />
          <div className="char-counter">
            <span className={`char-count ${charCountClass}`}>{length} / {MAX_BIO_LENGTH} characters</span>
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={isLoading}>
            Clear Bio
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading || isOverLimit}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              'Save Bio'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
