import axiosClient from './axiosClient';

export const userApi = {
  getProfile: () => axiosClient.get('/users/me'),
  updateProfile: (payload) => axiosClient.patch('/users/me', payload),
};
