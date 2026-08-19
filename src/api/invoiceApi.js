import axiosClient from './axiosClient';

export const invoiceApi = {
  createInvoice: (payload) => axiosClient.post('/invoices', payload),
  getInvoiceById: (id) => axiosClient.get(`/invoices/${id}`),
  getDailyCollection: (clinicId, date) => {
    let url = `/invoices/daily-collection?clinic_id=${clinicId}`;
    if (date) url += `&date=${date}`;
    return axiosClient.get(url);
  },
};
