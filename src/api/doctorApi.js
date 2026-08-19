import axiosClient from './axiosClient';

export const doctorApi = {
  getProfile: () => axiosClient.get('/doctors/profile'),
  updateProfile: (payload) => axiosClient.put('/doctors/profile', payload),
};
