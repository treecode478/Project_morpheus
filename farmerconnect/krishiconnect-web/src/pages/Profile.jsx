import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as profileService from '../services/profileService';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileCard from '../components/Profile/ProfileCard';
import ProfileTabs from '../components/Profile/ProfileTabs';
import '../styles/Profile.css';

export default function Profile() {
  const { userId } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const profileUserId = userId || currentUser?._id;

  useEffect(() => {
    let cancelled = false;
    async function fetchProfile() {
      if (!profileUserId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const res = await profileService.getUserProfile(isOwnProfile ? undefined : profileUserId);
        if (cancelled) return;
        if (res.success && res.user) {
          setUser(res.user);
          if (isOwnProfile && res.user) {
            updateUser(res.user);
          }
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProfile();
    return () => { cancelled = true; };
  }, [profileUserId, isOwnProfile, updateUser]);

  const handleProfileUpdate = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
    if (isOwnProfile && updatedData) {
      updateUser(updatedData);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card" style={{ padding: 48, textAlign: 'center' }}>
          <div className="spinner" style={{ borderColor: '#16a34a', borderTopColor: 'transparent', width: 40, height: 40 }} />
          <p style={{ marginTop: 16, color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: 16 }}>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <ProfileHeader
        backgroundImage={user.background?.url}
        backgroundPreset={user.backgroundPreset || 'default'}
        isOwnProfile={isOwnProfile}
        onBackgroundChange={handleProfileUpdate}
      />
      <ProfileCard
        user={user}
        isOwnProfile={isOwnProfile}
        onProfileUpdate={handleProfileUpdate}
      />
      <ProfileTabs userId={user._id} isOwnProfile={isOwnProfile} />
    </div>
  );
}
