import { useState } from 'react';
import UploadBackgroundModal from './Modals/UploadBackgroundModal';
import * as profileService from '../../services/profileService';
import toast from 'react-hot-toast';

const PRESET_STYLES = {
  default: { background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' },
  gradient_teal: { background: 'linear-gradient(135deg, #16a34a 0%, #6ee7b7 100%)' },
  gradient_blue: { background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
  gradient_purple: { background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)' },
  gradient_orange: { background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
  gradient_dark: { background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' },
  solid_green: { background: '#16a34a' },
  custom: {},
};

export default function ProfileHeader({ backgroundImage, backgroundPreset, isOwnProfile, onBackgroundChange }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const headerStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { ...(PRESET_STYLES[backgroundPreset] || PRESET_STYLES.default) };

  const handleSelect = async (preset, file) => {
    setLoading(true);
    try {
      const result = await profileService.updateBackground(preset, file);
      onBackgroundChange({
        backgroundPreset: result.backgroundPreset,
        background: result.user?.background,
        backgroundImage: result.backgroundImage || result.user?.background?.url,
      });
      toast.success('Background updated');
      setShowModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update background';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="profile-header" style={headerStyle}>
        {backgroundImage && <img src={backgroundImage} alt="" className="profile-header-image" aria-hidden />}
        {isOwnProfile && (
          <button
            type="button"
            className="profile-header-edit"
            onClick={() => setShowModal(true)}
          >
            🖼️ Edit Background
          </button>
        )}
      </div>
      <UploadBackgroundModal
        isOpen={showModal}
        currentPreset={backgroundPreset || 'default'}
        onClose={() => setShowModal(false)}
        onSelect={handleSelect}
        isLoading={loading}
      />
    </>
  );
}
