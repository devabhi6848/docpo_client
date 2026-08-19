import axiosClient from './axiosClient';

export const queueApi = {
  generateToken: (payload) => axiosClient.post('/queue/token', payload),
  getTodayQueue: (clinicId, doctorId, date) => {
    let url = `/queue/today?clinic_id=${clinicId}`;
    if (doctorId) url += `&doctor_id=${doctorId}`;
    if (date) url += `&date=${date}`;
    return axiosClient.get(url);
  },
  updateTokenStatus: (tokenId, status) =>
    axiosClient.patch(`/queue/${tokenId}/status`, { status }),
  getTvDisplay: (clinicId) => axiosClient.get(`/queue/tv-display/${clinicId}`),
};
