import axiosClient from './axiosClient';

export const analyticsApi = {
  getSummary: (clinicId, timeframe) => {
    let url = `/analytics/summary?clinic_id=${clinicId}`;
    if (timeframe) url += `&timeframe=${timeframe}`;
    return axiosClient.get(url);
  },
};
