import { apiClient } from './apiClient';

export interface SafeMeetupSpot {
  name: string;
  landmark: string;
  recommendedHours: string;
}

export interface ApiTransaction {
  id: string;
  _id?: string;
  conversation: string;
  listing: {
    id?: string;
    _id?: string;
    title: string;
    price: number;
    images?: string[];
  };
  buyer: {
    id?: string;
    _id?: string;
    fullName: string;
  };
  seller: {
    id?: string;
    _id?: string;
    fullName: string;
  };
  college: string;
  agreedPrice: number;
  status: 'AGREED' | 'MEETUP_SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  meetupSpot: {
    name: string;
    landmark?: string;
    scheduledDate?: string;
    isAgreedByBuyer: boolean;
    isAgreedBySeller: boolean;
  };
  buyerConfirmedHandoff: boolean;
  sellerConfirmedHandoff: boolean;
  cancellationReason?: string;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrustSignalItem {
  points: number;
  max?: number;
  description: string;
}

export interface UserTrustProfile {
  userId: string;
  fullName: string;
  college: string;
  branch: string;
  trustScore: number;
  tier: 'CAMPUS_CHAMPION' | 'TRUSTED_TRADER' | 'VERIFIED_PEER' | 'NEW_STUDENT';
  tierLabel: string;
  badges: string[];
  signals: {
    verification: TrustSignalItem;
    completedDeals: TrustSignalItem;
    peerRatings: TrustSignalItem;
    campusLongevity: TrustSignalItem;
    cancellationPenalty: TrustSignalItem;
    conductPenalty: TrustSignalItem;
  };
}

export const transactionService = {
  async getSafeMeetupSpots(): Promise<SafeMeetupSpot[]> {
    const res = await apiClient.get<{ spots: SafeMeetupSpot[] }>('/transactions/spots');
    return res.data.spots;
  },

  async getTransactionByConversation(conversationId: string): Promise<ApiTransaction | null> {
    const res = await apiClient.get<{ transaction: ApiTransaction | null }>(
      `/transactions/conversation/${conversationId}`
    );
    return res.data.transaction;
  },

  async updateMeetupSpot(
    transactionId: string,
    spotData: { spotName?: string; landmark?: string; scheduledDate?: string }
  ): Promise<ApiTransaction> {
    const res = await apiClient.post<{ transaction: ApiTransaction }>(
      `/transactions/${transactionId}/meetup`,
      spotData
    );
    return res.data.transaction;
  },

  async confirmHandoff(transactionId: string): Promise<ApiTransaction> {
    const res = await apiClient.post<{ transaction: ApiTransaction }>(
      `/transactions/${transactionId}/confirm`
    );
    return res.data.transaction;
  },

  async cancelTransaction(transactionId: string, reason?: string): Promise<ApiTransaction> {
    const res = await apiClient.post<{ transaction: ApiTransaction }>(
      `/transactions/${transactionId}/cancel`,
      { reason }
    );
    return res.data.transaction;
  },

  async createReview(data: {
    transactionId: string;
    rating: number;
    comment: string;
    punctual?: boolean;
    itemAsDescribed?: boolean;
  }): Promise<void> {
    await apiClient.post('/reviews', data);
  },

  async getTrustProfile(userId: string): Promise<UserTrustProfile> {
    const res = await apiClient.get<UserTrustProfile>(`/trust/profile/${userId}`);
    return res.data;
  },

  async reportItem(data: {
    targetType: 'LISTING' | 'USER' | 'CONVERSATION';
    reportedUserId?: string;
    reportedListingId?: string;
    reason: string;
    description: string;
  }): Promise<void> {
    await apiClient.post('/trust/reports', data);
  },
};
