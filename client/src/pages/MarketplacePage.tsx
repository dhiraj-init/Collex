import React, { useMemo, useState } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  RotateCcw,
  ArrowUpDown,
  Flame,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from '../components/marketplace/ListingCard';
import { CategoryBar } from '../components/marketplace/CategoryBar';
import { FilterDrawer } from '../components/marketplace/FilterDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { ListingSkeleton } from '../components/marketplace/ListingSkeleton';

const QUICK_SEARCH_EXAMPLES = [
  'Casio calculator',
  'DBMS book',
  'cycle',
  'Arduino',
  'TY CSE books',
];

export const MarketplacePage: React.FC = () => {
  const { 
    listings, 
    trendingListings,
    recentListings,
    isLoadingListings,
    searchQuery, 
    setSearchQuery, 
    activeCategory, 
    setActiveCategory,
    selectedCollege, 
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
    setIsFilterDrawerOpen
  } = useMarketplace();

  const [visibleCount, setVisibleCount] = useState(12);

  // Filter listings based on active search & criteria
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // 1. Campus Filter
      if (selectedCollege && item.college !== selectedCollege && selectedCollege !== 'All Campuses') {
        if (item.college !== selectedCollege) return false;
      }

      // 2. Search Query (Matches title, description, category, tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesLocation = item.campusLocation.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesLocation) {
          return false;
        }
      }

      // 3. Category Filter
      if (activeCategory !== 'All Items' && item.category !== activeCategory) {
        return false;
      }

      // 4. Condition Filter
      if (selectedConditions.length > 0 && !selectedConditions.includes(item.condition)) {
        return false;
      }

      // 5. Deal Type Filter
      if (selectedDealTypes.length > 0 && !selectedDealTypes.includes(item.dealType)) {
        return false;
      }

      // 6. Price Range
      if (item.price > priceRange[1] || item.price < priceRange[0]) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return b.viewsCount - a.viewsCount;
      return 0; // 'newest' default
    });
  }, [listings, selectedCollege, searchQuery, activeCategory, selectedConditions, selectedDealTypes, priceRange, sortBy]);

  const displayedListings = filteredListings.slice(0, visibleCount);

  // Campus context details
  const campusBadge = selectedCollege === 'All Campuses' ? 'All Verified Colleges' : selectedCollege;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Prominent Campus-Context Indicator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/40 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-400">
                  Hyperlocal Campus Marketplace
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-900/50 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Campus
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Showing peer listings at <span className="text-emerald-300">{campusBadge}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every listing belongs exclusively to enrolled peers. Direct handoffs at hostel gates and academic quads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Discover Items
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Buy textbooks, lab gear, calculators, cycles, and hostel essentials from seniors & batchmates.
          </p>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">Newest First</option>
              <option value="price-asc" className="bg-slate-900 text-slate-200">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900 text-slate-200">Price: High to Low</option>
              <option value="popular" className="bg-slate-900 text-slate-200">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Horizontal Bar */}
      <CategoryBar />

      {/* Search Input Bar with Quick Suggestion Chips */}
      <div className="space-y-2.5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search on campus (e.g., Casio calculator, DBMS book, cycle, Arduino, TY CSE books)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-8 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          <span className="text-[11px] text-slate-500 flex items-center mr-1">
            <Sparkles className="w-3 h-3 text-emerald-400 mr-1" />
            Popular searches:
          </span>
          {QUICK_SEARCH_EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setSearchQuery(example)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                searchQuery.toLowerCase() === example.toLowerCase()
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-medium'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Active:</span>

          {activeCategory !== 'All Items' && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700">
              <span>Category: {activeCategory}</span>
              <button type="button" onClick={() => setActiveCategory('All Items')}>
                <X className="w-3 h-3 hover:text-red-400" />
              </button>
            </span>
          )}

          {selectedDealTypes.map((deal) => (
            <span key={deal} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700">
              <span>{deal}</span>
              <button 
                type="button" 
                onClick={() => setSelectedDealTypes((prev) => prev.filter((d) => d !== deal))}
              >
                <X className="w-3 h-3 hover:text-red-400" />
              </button>
            </span>
          ))}

          {selectedConditions.map((cond) => (
            <span key={cond} className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700">
              <span>{cond}</span>
              <button 
                type="button" 
                onClick={() => setSelectedConditions((prev) => prev.filter((c) => c !== cond))}
              >
                <X className="w-3 h-3 hover:text-red-400" />
              </button>
            </span>
          ))}

          {priceRange[1] < 10000 && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700">
              <span>Under ₹{priceRange[1].toLocaleString('en-IN')}</span>
              <button type="button" onClick={() => setPriceRange([0, 10000])}>
                <X className="w-3 h-3 hover:text-red-400" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center space-x-1 ml-2"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Trending on your campus Section (Shown when browsing general feed) */}
      {!searchQuery && activeCategory === 'All Items' && trendingListings.length > 0 && (
        <section className="pt-2 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center">
                  Trending on your campus
                  <span className="ml-2 text-[10px] font-normal text-slate-400">
                    (Scored by student views & saves decay algorithm)
                  </span>
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingListings.slice(0, 4).map((listing) => (
              <ListingCard key={`trending-${listing.id}`} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Listed Section (Shown when browsing general feed) */}
      {!searchQuery && activeCategory === 'All Items' && recentListings.length > 0 && (
        <section className="pt-2 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Recently listed</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.slice(0, 4).map((listing) => (
              <ListingCard key={`recent-${listing.id}`} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Main Listing Grid Counter & Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <span>
          All Campus Listings: <span className="font-semibold text-slate-200">{filteredListings.length}</span> items
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Showing {displayedListings.length} of {filteredListings.length}
        </span>
      </div>

      {/* Main Listings Grid */}
      {isLoadingListings ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : displayedListings.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {/* Pagination / Load More Button */}
          {visibleCount < filteredListings.length && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors shadow-sm"
              >
                Load More Campus Items
              </button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No campus listings found"
          description={`No items matched "${searchQuery || activeCategory}" in ${selectedCollege}. Try clearing your search term or adjusting price filters.`}
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      )}

      {/* Filter Drawer Component */}
      <FilterDrawer />

    </div>
  );
};
