import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, ShieldCheck } from 'lucide-react';
import type { MockListing } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ListingCardProps {
  listing: MockListing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { isListingSaved, toggleSaveListing } = useMarketplace();
  const saved = isListingSaved(listing.id);

  const formatPrice = (price: number) => {
    if (price === 0) return 'FREE';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const discountPercent = listing.originalPrice && listing.originalPrice > listing.price
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Image Container */}
      <Link to={`/listing/${listing.id}`} className="block relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
        <img
          src={listing.photos[0]}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback image on error
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Status Overlays */}
        {listing.isSold && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
            <span className="font-bold text-xs uppercase tracking-wider px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Sold Out
            </span>
          </div>
        )}

        {listing.isReserved && !listing.isSold && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/80">
              Reserved
            </span>
          </div>
        )}

        {/* Category & Deal Type Badges */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5 z-10">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-800">
            {listing.category}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-800/70">
            {listing.condition}
          </span>
        </div>

        {/* Save / Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveListing(listing.id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900/90'
          }`}
          title={saved ? 'Remove from saved' : 'Save listing'}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </Link>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Discount */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline space-x-2">
              <span className={`text-lg font-bold tracking-tight ${listing.price === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {formatPrice(listing.price)}
              </span>
              {listing.originalPrice && listing.originalPrice > listing.price && (
                <span className="text-xs text-slate-500 line-through">
                  ₹{listing.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {discountPercent && discountPercent > 0 && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-1.5 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/listing/${listing.id}`} className="block group-hover:text-emerald-400 transition-colors">
            <h3 className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2 leading-snug">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
          {/* Campus Location */}
          <div className="flex items-center space-x-1.5 truncate">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{listing.campusLocation}</span>
          </div>

          {/* Seller Trust & Time */}
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center space-x-1 text-slate-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[120px]">{listing.seller.name}</span>
              <span className="text-slate-500 font-mono">({listing.seller.trustScore}%)</span>
            </div>
            <span className="text-slate-500 font-mono shrink-0">{listing.postedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
