import axiosClient from './axiosClient';

export const prescriptionApi = {
  issuePrescription: (payload) => axiosClient.post('/prescriptions', payload),
  getPrescriptionById: (id) => axiosClient.get(`/prescriptions/${id}`),
  getPatientPrescriptions: (patientId) => axiosClient.get(`/prescriptions/patient/${patientId}`),
};
