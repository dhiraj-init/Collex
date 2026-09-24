import { apiClient as api } from './apiClient';

export const collegeService = {
  getCollegeDashboard: async (slug: string) => {
    const res = await api.get<any>(`/colleges/${slug}/dashboard`);
    return res;
  },
  getMeetupSpots: async (slug: string) => {
    const res = await api.get(`/colleges/${slug}/meetup-spots`);
    return res.data;
  },
};
