import axiosClient from './axiosClient';

export const templateApi = {
  getTemplates: () => axiosClient.get('/templates'),
  createTemplate: (payload) => axiosClient.post('/templates', payload),
  updateTemplate: (id, payload) => axiosClient.put(`/templates/${id}`, payload),
  deleteTemplate: (id) => axiosClient.delete(`/templates/${id}`),
};
