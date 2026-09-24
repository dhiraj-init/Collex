import { apiClient as api } from './apiClient';

export const exchangeService = {
  proposeExchange: async (data: { targetListing: string; offeredListing?: string; offeredItemDescription?: string; cashAdjustment?: number; note?: string }) => {
    const res = await api.post('/exchanges', data);
    return res.data;
  },
  
  getMyProposals: async () => {
    const res = await api.get<any>('/exchanges');
    return res;
  },

  respondToProposal: async (id: string, action: 'ACCEPT' | 'REJECT') => {
    const res = await api.patch(`/exchanges/${id}/respond`, { action });
    return res.data;
  }
};
