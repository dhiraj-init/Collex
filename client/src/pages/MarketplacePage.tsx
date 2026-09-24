import React, { useMemo, useState } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  X, 
  RotateCcw,
  ArrowUpDown
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from '../components/marketplace/ListingCard';
import { CategoryBar } from '../components/marketplace/CategoryBar';
import { FilterDrawer } from '../components/marketplace/FilterDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { ListingSkeleton } from '../components/marketplace/ListingSkeleton';

export const MarketplacePage: React.FC = () => {
  const { 
    listings, 
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

  const [isLoading] = useState(false);

  // Filter listings based on active search & criteria
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // 1. Campus Filter
      if (selectedCollege && item.college !== selectedCollege && selectedCollege !== 'All Campuses') {
        // match selected campus
        if (item.college !== selectedCollege) return false;
      }

      // 2. Search Query
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
      if (item.price > priceRange[1]) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Campus Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified listings from students at <span className="text-emerald-400 font-semibold">{selectedCollege}</span>
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
              <option value="newest" className="bg-slate-900 text-slate-200">Newest Listings</option>
              <option value="price-asc" className="bg-slate-900 text-slate-200">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900 text-slate-200">Price: High to Low</option>
              <option value="popular" className="bg-slate-900 text-slate-200">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Horizontal Bar */}
      <CategoryBar />

      {/* Search Input Bar (Mobile / Primary) */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by keyword (e.g. Casio, Grewal, cycle, drafter)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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

      {/* Listing Counter & Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>
          Showing <span className="font-semibold text-slate-200">{filteredListings.length}</span> items
        </span>
        <span className="text-[11px] text-slate-500 font-mono">
          Hyperlocal to {selectedCollege}
        </span>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No campus listings found"
          description={`No items matched your current filter criteria in ${selectedCollege}. Try clearing your search term or adjusting price filters.`}
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      )}

      {/* Slide-over Filter Drawer Component */}
      <FilterDrawer />

    </div>
  );
};
