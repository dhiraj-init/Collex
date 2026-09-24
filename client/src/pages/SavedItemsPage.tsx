import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from '../components/marketplace/ListingCard';
import { EmptyState } from '../components/common/EmptyState';

export const SavedItemsPage: React.FC = () => {
  const { listings, savedListingIds } = useMarketplace();

  const savedListings = listings.filter((item) => savedListingIds.has(item.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Saved Campus Items</h1>
            <p className="text-xs text-slate-400">Items you bookmarked for later consideration or price drops</p>
          </div>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Grid or Empty */}
      {savedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {savedListings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved items yet"
          description="Whenever you find an item you might want to buy or keep an eye on, tap the bookmark icon on any listing card."
          actionText="Browse Campus Deals"
          onAction={() => window.location.href = '/marketplace'}
        />
      )}

    </div>
  );
};
