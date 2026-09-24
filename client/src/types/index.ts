/**
 * Core API Response Types
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: unknown;
  meta?: {
    timestamp: string;
    path?: string;
    [key: string]: unknown;
  };
}

export interface HealthData {
  service: string;
  status: 'healthy' | 'degraded';
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  database: {
    connected: boolean;
    state: string;
    code: number;
  };
  system: {
    nodeVersion: string;
    platform: string;
    memoryUsageMB: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
  };
}

/**
 * -----------------------------------------------------------------------------
 * INITIAL DATA-MODEL PROPOSALS (PHASE 0 ARCHITECTURE)
 * -----------------------------------------------------------------------------
 */

// 1. College
export interface College {
  id: string;
  name: string;
  code: string; // e.g. "STANFORD", "MIT", "BERKELEY"
  domains: string[]; // e.g. ["stanford.edu"]
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: [number, number]; // [longitude, latitude] for geo-spatial indexing
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 2. User
export interface User {
  id: string;
  email: string; // Must match college domain
  fullName: string;
  collegeId: string; // Reference to College
  avatarUrl?: string;
  bio?: string;
  isEmailVerified: boolean;
  verificationBadge: boolean;
  trustScore: number; // 0 - 100 based on reviews & verified transactions
  role: 'student' | 'campus_ambassador' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// 3. Listing
export type ListingCategory = 
  | 'textbooks'
  | 'electronics'
  | 'dorm_essentials'
  | 'appliances'
  | 'fashion'
  | 'notes_study_material'
  | 'bicycles'
  | 'other';

export type ListingType = 'sell' | 'rent' | 'exchange' | 'free';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  listingType: ListingType;
  price: number; // 0 for 'free'
  originalPrice?: number;
  condition: 'brand_new' | 'like_new' | 'good' | 'fair';
  photos: string[]; // Cloudinary secure URLs
  sellerId: string; // Reference to User
  collegeId: string; // Hyperlocal scope
  status: 'active' | 'reserved' | 'completed' | 'archived';
  viewsCount: number;
  likesCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// 4. Conversation
export interface Conversation {
  id: string;
  listingId: string; // Reference to Listing
  buyerId: string; // Reference to User
  sellerId: string; // Reference to User
  lastMessageSnippet?: string;
  lastMessageAt?: string;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  createdAt: string;
  updatedAt: string;
}

// 5. Message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrls?: string[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// 6. Offer
export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offeredPrice: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  counterPrice?: number;
  createdAt: string;
  updatedAt: string;
}

// 7. Transaction
export interface Transaction {
  id: string;
  listingId: string;
  offerId: string;
  buyerId: string;
  sellerId: string;
  collegeId: string;
  agreedPrice: number;
  status: 'pending_meetup' | 'completed' | 'cancelled' | 'disputed';
  meetupLocation?: string; // e.g. "Campus Library Entrance"
  verificationCode?: string; // 6-digit one-time meetup confirmation code
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

// 8. Review
export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string; // Student providing feedback
  revieweeId: string; // Student receiving feedback
  rating: number; // 1 to 5 stars
  comment: string;
  tags?: string[]; // e.g. "punctual", "item as described", "friendly"
  createdAt: string;
}

// 9. Report
export interface Report {
  id: string;
  reporterId: string;
  targetType: 'listing' | 'user' | 'message';
  targetId: string;
  reason: 'prohibited_item' | 'scam' | 'harassment' | 'incorrect_campus' | 'spam' | 'other';
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  resolvedByAdminId?: string;
  createdAt: string;
}

// 10. Notification
export interface Notification {
  id: string;
  recipientId: string;
  type: 
    | 'new_message'
    | 'offer_received'
    | 'offer_accepted'
    | 'offer_rejected'
    | 'meetup_scheduled'
    | 'transaction_completed'
    | 'review_received'
    | 'system_alert';
  title: string;
  body: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}
