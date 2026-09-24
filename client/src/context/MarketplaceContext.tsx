/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
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

interface MarketplaceContextType {
  listings: MockListing[];
  savedListingIds: Set<string>;
  toggleSaveListing: (id: string) => void;
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
  }) => string;
  toggleListingStatus: (id: string, action: 'reserve' | 'sold' | 'activate') => void;
  deleteListing: (id: string) => void;

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

  const toggleSaveListing = (id: string) => {
    setSavedListingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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

  const addListing = (data: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: MockListing['category'];
    dealType: MockListing['dealType'];
    condition: MockListing['condition'];
    photos: string[];
    campusLocation: string;
  }) => {
    const newId = `list-${Date.now()}`;
    const newListing: MockListing = {
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

    setListings((prev) => [newListing, ...prev]);

    // Also push a notification
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

  const toggleListingStatus = (id: string, action: 'reserve' | 'sold' | 'activate') => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (action === 'reserve') return { ...item, isReserved: true, isSold: false };
        if (action === 'sold') return { ...item, isSold: true, isReserved: false };
        return { ...item, isReserved: false, isSold: false };
      })
    );
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
    setSavedListingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
