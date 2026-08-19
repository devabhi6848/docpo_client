import axiosClient from './axiosClient';

export const growthApi = {
  getGrowthHistory: (patientId) => axiosClient.get(`/growth/patient/${patientId}`),
  recordGrowth: (patientId, payload) =>
    axiosClient.post(`/growth/patient/${patientId}`, payload),
};
