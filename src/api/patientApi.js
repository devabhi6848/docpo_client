import axiosClient from './axiosClient';

export const patientApi = {
  searchPatients: (clinicId, query) =>
    axiosClient.get(`/patients/search?clinic_id=${clinicId}&q=${encodeURIComponent(query)}`),
  createPatient: (payload) => axiosClient.post('/patients', payload),
  getPatientById: (id) => axiosClient.get(`/patients/${id}`),
  updatePatient: (id, payload) => axiosClient.put(`/patients/${id}`, payload),
  recordVitals: (patientId, payload) => axiosClient.post(`/patients/${patientId}/vitals`, payload),
  getVitalsTimeline: (patientId) => axiosClient.get(`/patients/${patientId}/vitals`),
};
