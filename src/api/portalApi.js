import axiosClient from './axiosClient';

export const portalApi = {
  getPortalData: (patientId) => axiosClient.get(`/portal/patient/${patientId}`),
};
