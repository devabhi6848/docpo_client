import axiosClient from './axiosClient';

export const clinicApi = {
  getMyClinics: () => axiosClient.get('/clinics/my-clinics'),
  getClinicById: (id) => axiosClient.get(`/clinics/${id}`),
  createClinic: (payload) => axiosClient.post('/clinics', payload),
  updateClinic: (id, payload) => axiosClient.put(`/clinics/${id}`, payload),
  switchActiveClinic: (clinic_id) => axiosClient.post('/clinics/switch-active', { clinic_id }),
  getClinicStaff: (clinicId) => axiosClient.get(`/clinics/${clinicId}/staff`),
  addStaff: (clinicId, payload) => axiosClient.post(`/clinics/${clinicId}/staff`, payload),
  updateStaff: (clinicId, staffId, payload) => axiosClient.put(`/clinics/${clinicId}/staff/${staffId}`, payload),
  removeStaff: (clinicId, staffId) => axiosClient.delete(`/clinics/${clinicId}/staff/${staffId}`),
};
