import axiosClient from './axiosClient';

export const medicineApi = {
  searchMedicines: (query) =>
    axiosClient.get(`/medicines/search?q=${encodeURIComponent(query || '')}`),
  createCustomMedicine: (payload) => axiosClient.post('/medicines', payload),
};
