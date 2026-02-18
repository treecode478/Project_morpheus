import { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { id: 'default', name: 'Default Green', type: 'solid', color: '#16a34a' },
  { id: 'gradient_teal', name: 'Teal Gradient', type: 'gradient', colors: ['#16a34a', '#6ee7b7'] },
  { id: 'gradient_blue', name: 'Blue Gradient', type: 'gradient', colors: ['#0ea5e9', '#06b6d4'] },
  { id: 'gradient_purple', name: 'Purple Gradient', type: 'gradient', colors: ['#9333ea', '#db2777'] },
  { id: 'gradient_orange', name: 'Orange Gradient', type: 'gradient', colors: ['#ea580c', '#f97316'] },
  { id: 'gradient_dark', name: 'Dark Gradient', type: 'gradient', colors: ['#1f2937', '#374151'] },
  { id: 'solid_green', name: 'Solid Green', type: 'solid', color: '#16a34a' },
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPT = 'image/jpeg,image/png,image/webp';

function PresetCard({ preset, selected, onSelect }) {
  const style =
    preset.type === 'solid'
      ? { background: preset.color }
      : { background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` };
  return (
    <div
      role="button"
      tabIndex={0}
      className={`preset-card ${selected ? 'selected' : ''}`}
      style={style}
      onClick={() => onSelect(preset.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(preset.id)}
      aria-pressed={selected}
      aria-label={preset.name}
    >
      {selected && <span style={{ position: 'absolute', top: 8, right: 8, color: 'white', fontWeight: 'bold' }}>✓</span>}
    </div>
  );
}

export default function UploadBackgroundModal({ isOpen, currentPreset = 'default', onClose, onSelect, isLoading }) {
  const [tab, setTab] = useState('presets');
  const [selectedPreset, setSelectedPreset] = useState(currentPreset);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(currentPreset);
      setTab('presets');
      setFile(null);
      setPreview(null);
      setError('');
    }
  }, [isOpen, currentPreset]);

  const validateFile = (f) => {
    setError('');
    if (!f) return false;
    if (!ACCEPT.split(',').some((t) => f.type === t.trim())) {
      setError('Invalid file type. Use JPG, PNG, or WebP');
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError('File exceeds 10MB limit');
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!validateFile(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer?.files?.[0]);
  };

  const handleSave = () => {
    if (tab === 'presets') {
      onSelect(selectedPreset, null);
    } else if (file) {
      onSelect('custom', file);
    } else {
      setError('Please select a preset or upload an image');
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="background-modal-title">
        <div className="modal-header">
          <h2 id="background-modal-title" className="modal-title">Customize Your Background</h2>
          <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <button
              type="button"
              className={`tab-item ${tab === 'presets' ? 'active' : ''}`}
              onClick={() => setTab('presets')}
            >
              Presets
            </button>
            <button
              type="button"
              className={`tab-item ${tab === 'custom' ? 'active' : ''}`}
              onClick={() => setTab('custom')}
            >
              Custom Upload
            </button>
          </div>

          {tab === 'presets' && (
            <div className="preset-grid">
              {PRESETS.filter((p) => p.id !== 'custom').map((preset) => (
                <div key={preset.id}>
                  <PresetCard
                    preset={preset}
                    selected={selectedPreset === preset.id}
                    onSelect={setSelectedPreset}
                  />
                  <div className="preset-label">{preset.name}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'custom' && (
            <>
              <div
                className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                onDrop={onDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  className="dropzone-input"
                  accept={ACCEPT}
                  onChange={onFileChange}
                />
                {!preview ? (
                  <>
                    <div className="dropzone-icon">🖼️</div>
                    <p className="dropzone-text">Drag background image here</p>
                    <p className="dropzone-hint">or click to browse. Max 10MB. JPG, PNG, WebP</p>
                  </>
                ) : (
                  <div className="image-preview" style={{ maxHeight: 200 }}>
                    <img src={preview} alt="Background preview" />
                  </div>
                )}
              </div>
            </>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading || (tab === 'presets' ? false : !file)}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Saving...
              </>
            ) : (
              'Save Background'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
