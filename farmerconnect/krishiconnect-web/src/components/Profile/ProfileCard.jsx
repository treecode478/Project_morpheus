import { useState } from 'react';
import EditBioModal from './Modals/EditBioModal';
import UploadPictureModal from './Modals/UploadPictureModal';
import * as profileService from '../../services/profileService';
import toast from 'react-hot-toast';

function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const STATS = [
  { key: 'followersCount', label: 'Followers', icon: '👥' },
  { key: 'followingCount', label: 'Following', icon: '🔗' },
  { key: 'postsCount', label: 'Posts', icon: '📄' },
  { key: 'likesCount', label: 'Likes', icon: '❤️' },
];

export default function ProfileCard({ user, isOwnProfile, onProfileUpdate }) {
  const [showBioModal, setShowBioModal] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);

  const avatarUrl = user?.avatar?.url;
  const name = user?.name || '';
  const bio = user?.bio ?? '';
  const location = user?.location;
  const locationStr = [location?.state, location?.district].filter(Boolean).join(', ');
  const stats = user?.stats || {};

  const handleSaveBio = async (newBio) => {
    setBioLoading(true);
    try {
      const result = newBio
        ? await profileService.updateBio(newBio)
        : await profileService.clearBio();
      onProfileUpdate({ bio: result.bio ?? null, ...result.user });
      toast.success(newBio ? 'Bio updated' : 'Bio cleared');
      setShowBioModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update bio';
      toast.error(msg);
    } finally {
      setBioLoading(false);
    }
  };

  const handleUploadPicture = async (file) => {
    setPictureLoading(true);
    try {
      const result = await profileService.uploadProfilePicture(file);
      onProfileUpdate({ avatar: result.user?.avatar, ...result.user });
      toast.success('Profile picture updated');
      setShowPictureModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload picture';
      toast.error(msg);
    } finally {
      setPictureLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Remove profile picture?')) return;
    setPictureLoading(true);
    try {
      await profileService.deleteProfilePicture();
      onProfileUpdate({ avatar: undefined });
      toast.success('Profile picture removed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove picture';
      toast.error(msg);
    } finally {
      setPictureLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-picture-section">
        <div className="profile-picture-wrapper">
          <div className="profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
          {isOwnProfile && (
            <>
              <button
                type="button"
                className="profile-picture-upload"
                title="Upload picture"
                onClick={() => setShowPictureModal(true)}
                aria-label="Upload profile picture"
              >
                📷
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  className="btn btn-text"
                  style={{ position: 'absolute', bottom: 0, left: 0, fontSize: 12 }}
                  onClick={handleRemovePicture}
                  disabled={pictureLoading}
                  title="Remove picture"
                >
                  Remove
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="profile-info">
        <h1 className="profile-name">{name || 'No name'}</h1>
        {locationStr && (
          <p className="profile-username">
            <span>📍</span> {locationStr}
          </p>
        )}
        <p className={`profile-bio ${!bio ? 'empty' : ''}`}>
          {bio || 'No bio yet. Tell us about yourself!'}
        </p>
        {isOwnProfile && (
          <button
            type="button"
            className="edit-bio-btn"
            onClick={() => setShowBioModal(true)}
          >
            ✏️ Edit Bio
          </button>
        )}
      </div>

      <div className="profile-stats">
        {STATS.map(({ key, label, icon }) => (
          <div key={key} className="stat-item">
            <div className="stat-icon">{icon}</div>
            <p className="stat-number">{(stats[key] ?? 0).toLocaleString()}</p>
            <p className="stat-label">{label}</p>
          </div>
        ))}
      </div>

      <EditBioModal
        isOpen={showBioModal}
        currentBio={bio}
        onClose={() => setShowBioModal(false)}
        onSave={handleSaveBio}
        isLoading={bioLoading}
      />
      <UploadPictureModal
        isOpen={showPictureModal}
        currentImage={avatarUrl}
        onClose={() => setShowPictureModal(false)}
        onUpload={handleUploadPicture}
        isLoading={pictureLoading}
      />
    </div>
  );
}
