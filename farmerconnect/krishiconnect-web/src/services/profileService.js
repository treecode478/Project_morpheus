/**
 * Profile API Service
 * Handles all profile-related API calls
 */

import { api } from './api';

/**
 * Get user profile
 * @param {string} userId - User ID to fetch (omit for current user)
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function getUserProfile(userId) {
  const path = userId ? `/users/${userId}` : '/users/me';
  const res = await api.get(path);
  const payload = res.data?.data ?? res.data;
  return { success: true, user: payload };
}

/**
 * Upload profile picture
 * @param {File} file - Image file
 * @param {Function} onProgress - Optional progress callback (percent 0-100)
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function uploadProfilePicture(file, onProgress) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => {
          const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          onProgress(percent);
        }
      : undefined,
  });
  const payload = res.data?.data ?? res.data;
  return { success: true, ...res.data, user: payload, profilePicture: payload?.avatar?.url };
}

/**
 * Delete profile picture
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteProfilePicture() {
  await api.delete('/users/me/avatar');
  return { success: true, profilePicture: null };
}

/**
 * Update user bio
 * @param {string} bio - Bio text (max 500 chars)
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function updateBio(bio) {
  const res = await api.put('/users/me/bio', { bio });
  const payload = res.data?.data ?? res.data;
  return { success: true, bio: payload?.bio, profileCompleteness: payload?.profileCompleteness, user: payload };
}

/**
 * Clear user bio
 * @returns {Promise<{ success: boolean }>}
 */
export async function clearBio() {
  const res = await api.delete('/users/me/bio');
  const payload = res.data?.data ?? res.data;
  return { success: true, bio: null, user: payload };
}

/**
 * Update background (preset or custom image)
 * @param {string} [preset] - Preset id
 * @param {File} [file] - Image file for custom background
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export async function updateBackground(preset, file) {
  if (file) {
    const formData = new FormData();
    formData.append('background', file);
    const res = await api.post('/users/me/background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload = res.data?.data ?? res.data;
    return {
      success: true,
      backgroundImage: payload?.background?.url,
      backgroundPreset: payload?.backgroundPreset,
      user: payload,
    };
  }
  const res = await api.post('/users/me/background', { preset });
  const payload = res.data?.data ?? res.data;
  return {
    success: true,
    backgroundPreset: payload?.backgroundPreset,
    backgroundImage: payload?.background?.url ?? null,
    user: payload,
  };
}

/**
 * Get available background presets
 * @returns {Promise<{ success: boolean, presets: Array }>}
 */
export async function getBackgroundPresets() {
  const res = await api.get('/users/profile/backgrounds');
  const data = res.data?.data ?? res.data;
  const presets = data?.presets ?? data;
  return { success: true, presets: Array.isArray(presets) ? presets : [] };
}

export default {
  getUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  updateBio,
  clearBio,
  updateBackground,
  getBackgroundPresets,
};
