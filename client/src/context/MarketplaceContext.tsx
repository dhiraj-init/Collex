/* oxlint-disable react/only-export-components, react/set-state-in-effect */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  MockListing, 
  MockNotification,
  MockConversation
} from '../data/mockData';
import { 
  INITIAL_MOCK_LISTINGS, 
  CURRENT_STUDENT_USER, 
  MOCK_NOTIFICATIONS, 
  MOCK_CONVERSATIONS
} from '../data/mockData';
import { listingService } from '../services/listingService';
import type { ApiListing } from '../services/listingService';

export function apiListingToMockListing(item: ApiListing): MockListing {
  const categoryMap: Record<string, MockListing['category']> = {
    TEXTBOOKS: 'Books',
    ELECTRONICS: 'Electronics',
    BICYCLES: 'Cycles',
    DORM_ESSENTIALS: 'Hostel Essentials',
    APPLIANCES: 'Hostel Essentials',
    FASHION: 'Fashion',
    NOTES_STUDY_MATERIAL: 'Books',
    OTHER: 'Electronics',
  };

  const conditionMap: Record<string, MockListing['condition']> = {
    BRAND_NEW: 'Brand New',
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    FAIR: 'Fair',
  };

  const dealTypeMap: Record<string, MockListing['dealType']> = {
    SELL: 'Sell',
    RENT: 'Rent',
    EXCHANGE: 'Exchange',
    FREE: 'Free',
  };

  return {
    id: item.id || (item._id as string),
    title: item.title,
    description: item.description,
    price: item.price,
    originalPrice: item.originalPrice,
    category: categoryMap[item.category] || 'Electronics',
    dealType: dealTypeMap[item.listingType] || 'Sell',
    condition: conditionMap[item.itemCondition] || 'Good',
    photos: item.images && item.images.length > 0 
      ? item.images 
      : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    college: item.college,
    campusLocation: `${item.college} Campus`,
    postedAt: new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    }),
    viewsCount: item.viewsCount || 0,
    likesCount: item.savesCount || 0,
    isReserved: item.status === 'RESERVED',
    isSold: item.status === 'SOLD',
    seller: {
      id: item.seller?._id || item.seller?.id || 'demo-seller',
      name: item.seller?.fullName || 'Verified Student',
      avatar: item.seller?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      college: item.seller?.college || item.college,
      branch: item.seller?.branch || 'Engineering',
      year: '2026',
      trustScore: item.seller?.trustScore || 90,
      rating: 4.9,
      reviewCount: 15,
      isVerified: item.seller?.verificationStatus === 'STUDENT_VERIFIED',
      joinedDate: 'Joined recently',
    },
  };
}

interface MarketplaceContextType {
  listings: MockListing[];
  trendingListings: MockListing[];
  recentListings: MockListing[];
  isLoadingListings: boolean;
  savedListingIds: Set<string>;
  toggleSaveListing: (id: string) => Promise<void>;
  isListingSaved: (id: string) => boolean;
  
  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  selectedCollege: string;
  setSelectedCollege: (college: string) => void;
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDealTypes: string[];
  setSelectedDealTypes: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  setSortBy: (sort: 'newest' | 'price-asc' | 'price-desc' | 'popular') => void;
  resetFilters: () => void;
  activeFiltersCount: number;

  // Filter Drawer UI
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;

  // Add / Edit Listing
  addListing: (listingData: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: MockListing['category'];
    dealType: MockListing['dealType'];
    condition: MockListing['condition'];
    photos: string[];
    campusLocation: string;
  }) => Promise<string>;
  toggleListingStatus: (id: string, action: 'reserve' | 'sold' | 'activate') => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  refreshListings: () => Promise<void>;

  // Messaging & Notifications
  conversations: MockConversation[];
  sendMessage: (conversationId: string, text: string) => void;
  notifications: MockNotification[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;

  // Current Student
  user: typeof CURRENT_STUDENT_USER;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<MockListing[]>(INITIAL_MOCK_LISTINGS);
  const [trendingListings, setTrendingListings] = useState<MockListing[]>([]);
  const [recentListings, setRecentListings] = useState<MockListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(
    new Set(CURRENT_STUDENT_USER.savedListingIds)
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [selectedCollege, setSelectedCollege] = useState('IIT Bombay');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [conversations, setConversations] = useState<MockConversation[]>(MOCK_CONVERSATIONS);
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const user = CURRENT_STUDENT_USER;

  // Fetch real listings from MongoDB backend
  const fetchBackendListings = useCallback(async () => {
    setIsLoadingListings(true);
    try {
      const [allRes, trendingRes, recentRes] = await Promise.all([
        listingService.getListings({
          college: selectedCollege,
          search: searchQuery,
          limit: 30,
        }).catch(() => null),
        listingService.getTrendingListings(selectedCollege).catch(() => null),
        listingService.getRecentlyListed(selectedCollege).catch(() => null),
      ]);

      if (allRes && allRes.listings && allRes.listings.length > 0) {
        const mapped = allRes.listings.map(apiListingToMockListing);
        setListings(mapped);
      }

      if (trendingRes && trendingRes.listings && trendingRes.listings.length > 0) {
        setTrendingListings(trendingRes.listings.map(apiListingToMockListing));
      }

      if (recentRes && recentRes.listings && recentRes.listings.length > 0) {
        setRecentListings(recentRes.listings.map(apiListingToMockListing));
      }
    } catch (err) {
      console.warn('[Marketplace] Falling back to local data:', err);
    } finally {
      setIsLoadingListings(false);
    }
  }, [selectedCollege, searchQuery]);

  useEffect(() => {
    void fetchBackendListings();
  }, [fetchBackendListings]);

  const toggleSaveListing = async (id: string) => {
    // Optimistic UI update
    setSavedListingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    try {
      await listingService.toggleSave(id);
    } catch {
      // Revert if API fails
      console.warn('[Save] Operating in local mode');
    }
  };

  const isListingSaved = (id: string) => savedListingIds.has(id);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Items');
    setSelectedConditions([]);
    setSelectedDealTypes([]);
    setPriceRange([0, 10000]);
    setSortBy('newest');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== 'All Items') count++;
    if (selectedConditions.length > 0) count += selectedConditions.length;
    if (selectedDealTypes.length > 0) count += selectedDealTypes.length;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [activeCategory, selectedConditions, selectedDealTypes, priceRange, searchQuery]);

  const addListing = async (data: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: MockListing['category'];
    dealType: MockListing['dealType'];
    condition: MockListing['condition'];
    photos: string[];
    campusLocation: string;
  }): Promise<string> => {
    // Map category to backend enum
    const categoryEnumMap: Record<string, string> = {
      Books: 'TEXTBOOKS',
      Electronics: 'ELECTRONICS',
      Cycles: 'BICYCLES',
      Calculators: 'ELECTRONICS',
      'Lab Equipment': 'NOTES_STUDY_MATERIAL',
      'Hostel Essentials': 'DORM_ESSENTIALS',
      Furniture: 'DORM_ESSENTIALS',
      Fashion: 'FASHION',
      Sports: 'OTHER',
      'Free Stuff': 'OTHER',
    };

    const conditionEnumMap: Record<string, string> = {
      'Brand New': 'BRAND_NEW',
      'Like New': 'LIKE_NEW',
      Good: 'GOOD',
      Fair: 'FAIR',
    };

    const dealTypeEnumMap: Record<string, string> = {
      Sell: 'SELL',
      Rent: 'RENT',
      Exchange: 'EXCHANGE',
      Free: 'FREE',
    };

    let newId = `list-${Date.now()}`;

    try {
      const apiListing = await listingService.createListing({
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: categoryEnumMap[data.category] || 'OTHER',
        itemCondition: conditionEnumMap[data.condition] || 'GOOD',
        listingType: dealTypeEnumMap[data.dealType] || 'SELL',
        images: data.photos,
      });

      if (apiListing && (apiListing.id || apiListing._id)) {
        newId = apiListing.id || (apiListing._id as string);
        const mapped = apiListingToMockListing(apiListing);
        setListings((prev) => [mapped, ...prev]);
      }
    } catch {
      // Local fallback
      const localListing: MockListing = {
        id: newId,
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        category: data.category,
        dealType: data.dealType,
        condition: data.condition,
        photos: data.photos.length > 0 
          ? data.photos 
          : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
        college: selectedCollege,
        campusLocation: data.campusLocation || 'Hostel 16, Ground Floor',
        postedAt: 'Just now',
        viewsCount: 1,
        likesCount: 0,
        seller: {
          id: user.id,
          name: user.fullName,
          avatar: user.avatar,
          college: user.college,
          branch: user.branch,
          year: '3rd Year',
          trustScore: user.trustScore,
          rating: user.rating,
          reviewCount: user.reviewsCount,
          isVerified: true,
          joinedDate: user.joinedDate,
        },
      };
      setListings((prev) => [localListing, ...prev]);
    }

    // Push local notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'Listing Published Successfully!',
        message: `Your listing "${data.title}" is now active in ${selectedCollege}.`,
        time: 'Just now',
        isRead: false,
        link: `/listing/${newId}`,
      },
      ...prev,
    ]);

    return newId;
  };

  const toggleListingStatus = async (id: string, action: 'reserve' | 'sold' | 'activate') => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (action === 'reserve') return { ...item, isReserved: true, isSold: false };
        if (action === 'sold') return { ...item, isSold: true, isReserved: false };
        return { ...item, isReserved: false, isSold: false };
      })
    );

    try {
      const statusMap = {
        reserve: 'RESERVED' as const,
        sold: 'SOLD' as const,
        activate: 'ACTIVE' as const,
      };
      await listingService.updateStatus(id, statusMap[action]);
    } catch {
      // Local state already updated
    }
  };

  const deleteListing = async (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    setSavedListingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    try {
      await listingService.deleteListing(id);
    } catch {
      // Local state already updated
    }
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderId: 'me',
          senderName: user.fullName,
          text: text.trim(),
          time: timeString,
          isMe: true,
        };
        return {
          ...c,
          lastMessage: text.trim(),
          lastMessageTime: 'Just now',
          messages: [...c.messages, newMsg],
        };
      })
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <MarketplaceContext.Provider
      value={{
        listings,
        trendingListings,
        recentListings,
        isLoadingListings,
        savedListingIds,
        toggleSaveListing,
        isListingSaved,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        selectedCollege,
        setSelectedCollege,
        selectedConditions,
        setSelectedConditions,
        selectedDealTypes,
        setSelectedDealTypes,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        resetFilters,
        activeFiltersCount,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        addListing,
        toggleListingStatus,
        deleteListing,
        refreshListings: fetchBackendListings,
        conversations,
        sendMessage,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        user,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
