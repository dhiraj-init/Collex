import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  MapPin
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { EmptyState } from '../components/common/EmptyState';

export const MyListingsPage: React.FC = () => {
  const { listings, user, toggleListingStatus, deleteListing } = useMarketplace();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'reserved' | 'sold'>('all');

  const myListings = listings.filter((item) => item.seller.id === user.id);

  const filtered = myListings.filter((item) => {
    if (filterStatus === 'active') return !item.isReserved && !item.isSold;
    if (filterStatus === 'reserved') return item.isReserved && !item.isSold;
    if (filterStatus === 'sold') return item.isSold;
    return true;
  });

  const totalViews = myListings.reduce((sum, item) => sum + item.viewsCount, 0);
  const activeCount = myListings.filter((i) => !i.isReserved && !i.isSold).length;
  const reservedCount = myListings.filter((i) => i.isReserved && !i.isSold).length;
  const soldCount = myListings.filter((i) => i.isSold).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">My Campus Listings</h1>
          <p className="text-xs text-slate-400">Manage items you are selling, renting, or giving away to peers</p>
        </div>

        <Link
          to="/sell"
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Listing</span>
        </Link>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-[11px] uppercase block mb-1">Total Active</span>
          <span className="text-xl font-bold text-white font-mono">{activeCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-[11px] uppercase block mb-1">In Negotiation / Reserved</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{reservedCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-[11px] uppercase block mb-1">Items Handed Over</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{soldCount}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-400 text-[11px] uppercase block mb-1">Total Student Views</span>
          <span className="text-xl font-bold text-slate-200 font-mono">{totalViews}</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs border-b border-slate-800 pb-2">
        {(['all', 'active', 'reserved', 'sold'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
              filterStatus === tab
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center space-x-4">
                <img
                  src={item.photos[0]}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-800 shrink-0"
                />

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    {item.isSold ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Sold
                      </span>
                    ) : item.isReserved ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                        Reserved
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="font-bold text-white font-mono">
                      {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString('en-IN')}`}
                    </span>
                    <span>•</span>
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{item.campusLocation}</span>
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Posted {item.postedAt} • {item.viewsCount} views
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end sm:self-auto">
                <Link
                  to={`/listing/${item.id}`}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="View Item"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {!item.isSold && (
                  <>
                    {item.isReserved ? (
                      <button
                        type="button"
                        onClick={() => toggleListingStatus(item.id, 'activate')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        Unreserve
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleListingStatus(item.id, 'reserve')}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-800/80 text-xs text-amber-300 hover:bg-amber-950/40"
                      >
                        Reserve
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleListingStatus(item.id, 'sold')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-xs text-emerald-300 hover:bg-emerald-900/60 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Sold</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => deleteListing(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No listings in this tab"
          description="You do not have any items matching this filter status."
          actionText="Create a Campus Listing"
          onAction={() => window.location.href = '/sell'}
        />
      )}

    </div>
  );
};
