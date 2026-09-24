import { apiClient as api } from './apiClient';

export interface WantedPost {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredConditions: string[];
  status: 'OPEN' | 'FULFILLED' | 'EXPIRED' | 'CLOSED';
  poster: {
    id: string;
    fullName: string;
    avatar?: string;
    college: string;
    branch?: string;
    graduationYear?: number;
    trustScore?: number;
  };
  createdAt: string;
}

export const wantedService = {
  getPosts: async (college?: string) => {
    const endpoint = college ? `/wanted?college=${encodeURIComponent(college)}` : '/wanted';
    const res = await api.get<any>(endpoint);
    return res;
  },
  
  createPost: async (data: { title: string; description?: string; category: string; budgetMin?: number; budgetMax?: number }) => {
    const res = await api.post('/wanted', data);
    return res.data;
  },

  closePost: async (id: string) => {
    const res = await api.patch(`/wanted/${id}/close`);
    return res.data;
  },
};
