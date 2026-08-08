import axiosClient from './axiosClient';

export const authApi = {
  // Fetch available authentication options enabled by backend
  getAuthMethods: () => axiosClient.get('/users/auth-methods'),

  // Password Authentication
  register: (payload) => axiosClient.post('/users/register', payload),
  login: (payload) => axiosClient.post('/users/login', payload),

  // OTP Authentication
  sendOtp: (payload) => axiosClient.post('/users/otp/send', payload),
  registerWithOtp: (payload) => axiosClient.post('/users/otp/register', payload),
  loginWithOtp: (payload) => axiosClient.post('/users/otp/verify', payload),

  // Google OAuth
  loginWithGoogle: (payload) => axiosClient.post('/users/google', payload),

  // Token & Session Management
  refreshToken: (refreshToken) => axiosClient.post('/users/refresh', { refreshToken }),
  logout: (refreshToken) => axiosClient.post('/users/logout', { refreshToken }),
};
