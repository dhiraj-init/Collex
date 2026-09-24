import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';
import { apiClient } from './apiClient';

export interface ChatParticipant {
  id?: string;
  _id?: string;
  fullName: string;
  avatar?: string;
  college?: string;
  branch?: string;
  trustScore?: number;
  verificationStatus?: string;
}

export interface ChatListing {
  id?: string;
  _id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  status: string;
  college: string;
}

export interface ApiConversation {
  id: string;
  _id?: string;
  buyer: ChatParticipant;
  seller: ChatParticipant;
  listing: ChatListing;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  isBlocked: boolean;
  blockedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  id: string;
  _id?: string;
  conversation: string;
  sender: {
    id?: string;
    _id?: string;
    fullName: string;
    avatar?: string;
  };
  text: string;
  type: 'TEXT' | 'OFFER' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED' | 'OFFER_COUNTER' | 'SYSTEM';
  offer?: {
    price: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
    counterPrice?: number;
  };
  createdAt: string;
}

let socketInstance: Socket | null = null;

export const chatService = {
  /**
   * Initializes or returns the authenticated Socket.IO singleton
   */
  getSocket(): Socket {
    if (!socketInstance) {
      const token = localStorage.getItem('collex_access_token') || '';
      const socketUrl = env.apiUrl.replace(/\/api\/v1\/?$/, '');

      socketInstance = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
      });
    }
    return socketInstance;
  },

  disconnectSocket(): void {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },

  async getConversations(): Promise<ApiConversation[]> {
    const res = await apiClient.get<{ conversations: ApiConversation[] }>('/chat/conversations');
    return res.data.conversations;
  },

  async getOrCreateConversation(listingId: string): Promise<ApiConversation> {
    const res = await apiClient.post<{ conversation: ApiConversation }>('/chat/conversations', {
      listingId,
    });
    return res.data.conversation;
  },

  async getMessages(conversationId: string): Promise<ApiMessage[]> {
    const res = await apiClient.get<{ messages: ApiMessage[] }>(
      `/chat/conversations/${conversationId}/messages`
    );
    return res.data.messages;
  },

  async blockConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/block`);
  },

  async reportConversation(
    conversationId: string,
    reason: string,
    description: string
  ): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/report`, {
      reason,
      description,
    });
  },
};
