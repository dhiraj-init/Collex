import { apiClient } from './apiClient';

export interface ListingSeller {
  id?: string;
  _id?: string;
  fullName: string;
  avatar?: string;
  college?: string;
  branch?: string;
  trustScore?: number;
  verificationStatus?: 'UNVERIFIED' | 'EMAIL_VERIFIED' | 'STUDENT_VERIFIED';
}

export interface ApiListing {
  id: string;
  _id?: string;
  seller: ListingSeller;
  college: string;
  title: string;
  description: string;
  category: string;
  listingType: 'SELL' | 'RENT' | 'EXCHANGE' | 'FREE';
  price: number;
  negotiable: boolean;
  originalPrice?: number;
  itemCondition: 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
  brand?: string;
  purchaseAge?: string;
  images: string[];
  tags: string[];
  status: 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
  viewsCount: number;
  savesCount: number;
  savedBy?: string[];
  trendingScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFilterParams {
  college?: string;
  search?: string;
  category?: string;
  listingType?: string;
  condition?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ListingsResponseData {
  listings: ApiListing[];
  campusContext: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SellerAnalytics {
  totalItems: number;
  activeItems: number;
  reservedItems: number;
  soldItems: number;
  totalViews: number;
  totalSaves: number;
}

export const listingService = {
  /**
   * Fetch listings with campus scoping, search and filtering
   */
  async getListings(params: ListingFilterParams = {}): Promise<ListingsResponseData> {
    const query = new URLSearchParams();
    if (params.college) query.set('college', params.college);
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.listingType && params.listingType !== 'all') query.set('listingType', params.listingType);
    if (params.condition && params.condition !== 'all') query.set('condition', params.condition);
    if (params.minPrice !== undefined && params.minPrice !== '') query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice !== '') query.set('maxPrice', String(params.maxPrice));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<ListingsResponseData>(`/listings?${query.toString()}`);
    return response.data;
  },

  /**
   * Fetch trending listings on campus using decaying score algorithm
   */
  async getTrendingListings(college?: string): Promise<{ campus: string; algorithm: string; listings: ApiListing[] }> {
    const query = college ? `?college=${encodeURIComponent(college)}` : '';
    const response = await apiClient.get<{ campus: string; algorithm: string; listings: ApiListing[] }>(
      `/listings/trending${query}`
    );
    return response.data;
  },

  /**
   * Fetch recently listed items on campus
   */
  async getRecentlyListed(college?: string): Promise<{ campus: string; listings: ApiListing[] }> {
    const query = college ? `?college=${encodeURIComponent(college)}` : '';
    const response = await apiClient.get<{ campus: string; listings: ApiListing[] }>(`/listings/recent${query}`);
    return response.data;
  },

  /**
   * Fetch listing detail with seller info and related campus listings
   */
  async getListingById(id: string): Promise<{ listing: ApiListing; relatedListings: ApiListing[] }> {
    const response = await apiClient.get<{ listing: ApiListing; relatedListings: ApiListing[] }>(`/listings/${id}`);
    return response.data;
  },

  /**
   * Post new campus listing
   */
  async createListing(data: {
    title: string;
    description: string;
    category: string;
    listingType?: string;
    price: number;
    negotiable?: boolean;
    originalPrice?: number;
    itemCondition: string;
    brand?: string;
    purchaseAge?: string;
    images?: string[];
    tags?: string[];
  }): Promise<ApiListing> {
    const response = await apiClient.post<{ listing: ApiListing }>('/listings', data);
    return response.data.listing;
  },

  /**
   * Update existing listing
   */
  async updateListing(id: string, data: Partial<ApiListing>): Promise<ApiListing> {
    const response = await apiClient.put<{ listing: ApiListing }>(`/listings/${id}`, data);
    return response.data.listing;
  },

  /**
   * Update status (ACTIVE, RESERVED, SOLD, ARCHIVED)
   */
  async updateStatus(id: string, status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED'): Promise<ApiListing> {
    const response = await apiClient.patch<{ listing: ApiListing }>(`/listings/${id}/status`, { status });
    return response.data.listing;
  },

  /**
   * Delete / remove listing
   */
  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },

  /**
   * Toggle bookmark/save listing
   */
  async toggleSave(id: string): Promise<{ isSaved: boolean; savesCount: number }> {
    const response = await apiClient.post<{ isSaved: boolean; savesCount: number }>(`/listings/${id}/save`);
    return response.data;
  },

  /**
   * Fetch seller dashboard items and statistics
   */
  async getMyListings(): Promise<{ analytics: SellerAnalytics; listings: ApiListing[] }> {
    const response = await apiClient.get<{ analytics: SellerAnalytics; listings: ApiListing[] }>('/listings/me/items');
    return response.data;
  },

  /**
   * Fetch saved listings
   */
  async getSavedListings(): Promise<ApiListing[]> {
    const response = await apiClient.get<{ listings: ApiListing[] }>('/listings/me/saved');
    return response.data.listings;
  },

  /**
   * Upload listing image asset
   */
  async uploadImage(imageSource: string): Promise<string> {
    const response = await apiClient.post<{ url: string }>('/listings/upload', { image: imageSource });
    return response.data.url;
  },
};
