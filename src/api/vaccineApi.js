import axiosClient from './axiosClient';

export const vaccineApi = {
  getSchedule: (patientId) => axiosClient.get(`/vaccines/patient/${patientId}`),
  markGiven: (recordId, payload) =>
    axiosClient.patch(`/vaccines/${recordId}/given`, payload),
};
