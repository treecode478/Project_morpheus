import { api } from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  verifyRegistrationOTP: (data) => api.post('/auth/verify-registration-otp', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: (refreshToken) =>
    api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
};
