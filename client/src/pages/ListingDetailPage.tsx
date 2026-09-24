import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Tag, 
  CheckCircle2, 
  Check, 
  Eye
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from '../components/marketplace/ListingCard';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { listings, isListingSaved, toggleSaveListing, sendMessage, conversations } = useMarketplace();

  const listing = listings.find((item) => item.id === id);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState<number | string>(listing ? listing.price : '');
  const [offerNote, setOfferNote] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Listing Not Found</h2>
        <p className="text-xs text-slate-400">This item may have been sold or removed by the student.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const saved = isListingSaved(listing.id);
  const discountPercent = listing.originalPrice && listing.originalPrice > listing.price
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleMakeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    setOfferSuccess(true);
    setTimeout(() => {
      setOfferSuccess(false);
      setIsOfferModalOpen(false);
      // Navigate to chat
      navigate('/messages');
    }, 1200);
  };

  const handleStartChat = () => {
    const conv = conversations.find(c => c.listingId === listing.id);
    if (conv) {
      navigate('/messages');
    } else {
      // Send initial inquiry message
      sendMessage(conversations[0]?.id || 'conv-1', `Hi ${listing.seller.name}! Is "${listing.title}" still available?`);
      navigate('/messages');
    }
  };

  const relatedListings = listings
    .filter((item) => item.id !== listing.id && (item.category === listing.category || item.college === listing.college))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSaveListing(listing.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              saved 
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Listing Layout: Left Images, Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Photo Gallery (lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Photo View */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
            <img
              src={listing.photos[activePhotoIndex] || listing.photos[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.dealType === 'Free' && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md shadow-sm">
                FREE HAND-ME-DOWN
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {listing.photos.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {listing.photos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhotoIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Safety Notice Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-slate-100">Collex Campus Safety Promise</span>
              <p className="text-slate-400 font-normal leading-relaxed text-[11px]">
                Always arrange in-person exchanges during daytime at designated public campus areas such as the Central Library, Department lobbies, or SAC. Inspect the item thoroughly before finalizing.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Pricing, Description, Seller & Actions (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Item Meta & Pricing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
            
            {/* Category & Condition Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {listing.category}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                {listing.condition}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                {listing.dealType}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {listing.title}
            </h1>

            {/* Price Box */}
            <div className="flex items-baseline space-x-3 pb-3 border-b border-slate-800">
              <span className={`text-3xl font-extrabold tracking-tight ${listing.price === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {listing.price === 0 ? 'FREE' : `₹${listing.price.toLocaleString('en-IN')}`}
              </span>
              {listing.originalPrice && listing.originalPrice > listing.price && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-sm text-slate-500 line-through">
                    ₹{listing.originalPrice.toLocaleString('en-IN')}
                  </span>
                  {discountPercent && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Campus Meetup Location */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                Campus Handoff Location
              </span>
              <div className="flex items-center space-x-2 text-slate-200 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium truncate">{listing.campusLocation}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartChat}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl shadow-md transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Student Seller</span>
              </button>

              {listing.price > 0 && (
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all"
                >
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>Make a Campus Offer</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{listing.viewsCount} views</span>
              </span>
              <span>Posted {listing.postedAt}</span>
            </div>

          </div>

          {/* Seller Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Verified Student Seller
            </span>

            <div className="flex items-start space-x-3.5">
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm text-white truncate">{listing.seller.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-400 truncate">{listing.seller.branch}</p>
                <p className="text-[11px] text-slate-500 font-mono">{listing.seller.college} • {listing.seller.year}</p>
              </div>
            </div>

            {/* Seller Trust Bar */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-emerald-400 font-bold block">{listing.seller.trustScore}%</span>
                <span className="text-[10px] text-slate-500">Trust Score</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-white font-bold block">{listing.seller.rating} / 5</span>
                <span className="text-[10px] text-slate-500">Rating</span>
              </div>
              <div>
                <span className="text-white font-bold block">{listing.seller.reviewCount}</span>
                <span className="text-[10px] text-slate-500">Deals Done</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-semibold text-sm text-white">Item Description</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {listing.description}
            </p>
          </div>

        </div>

      </div>

      {/* Related Campus Listings */}
      {relatedListings.length > 0 && (
        <div className="pt-8 border-t border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">More from {listing.college}</h3>
            <Link to="/marketplace" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {relatedListings.map((rel) => (
              <ListingCard key={rel.id} listing={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setIsOfferModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-white">Make an Offer</h3>
            <p className="text-xs text-slate-400">
              Submit your proposed price to <span className="text-white font-medium">{listing.seller.name}</span> for {listing.title}.
            </p>

            {offerSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="text-xs font-semibold">Offer Dispatched!</p>
                <p className="text-[11px] text-emerald-400/80">Opening conversation thread with seller...</p>
              </div>
            ) : (
              <form onSubmit={handleMakeOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Offer Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      max={listing.price}
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-mono outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Listed price is ₹{listing.price.toLocaleString('en-IN')}.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Message / Preferred Campus Meetup Point (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Can meet today evening at Central Library or SAC..."
                    value={offerNote}
                    onChange={(e) => setOfferNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                  >
                    Submit Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
