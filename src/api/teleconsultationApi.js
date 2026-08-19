import axiosClient from './axiosClient';

export const teleconsultationApi = {
  createSession: (payload) => axiosClient.post('/teleconsultations', payload),
  getSession: (meetingId) => axiosClient.get(`/teleconsultations/room/${meetingId}`),
  updateStatus: (meetingId, payload) =>
    axiosClient.patch(`/teleconsultations/room/${meetingId}/status`, payload),
};
