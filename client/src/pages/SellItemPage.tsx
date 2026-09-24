import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  MapPin, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import type { MockListing } from '../data/mockData';

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hostel Cooker', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lab Drafter', url: 'https://images.unsplash.com/photo-1581291518655-9523c932ede3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bed Study Table', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' },
];

const CATEGORIES: MockListing['category'][] = [
  'Books',
  'Electronics',
  'Cycles',
  'Calculators',
  'Lab Equipment',
  'Hostel Essentials',
  'Furniture',
  'Fashion',
  'Sports',
  'Free Stuff',
];

const CONDITIONS: MockListing['condition'][] = [
  'Brand New',
  'Like New',
  'Good',
  'Fair',
];

export const SellItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { addListing, selectedCollege, user } = useMarketplace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MockListing['category']>('Books');
  const [dealType, setDealType] = useState<MockListing['dealType']>('Sell');
  const [condition, setCondition] = useState<MockListing['condition']>('Like New');
  const [price, setPrice] = useState<number | string>(500);
  const [originalPrice, setOriginalPrice] = useState<number | string>(1200);
  const [campusLocation, setCampusLocation] = useState('Hostel 16, Wing B or Central Library');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTO_PRESETS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  const activePhoto = customPhotoUrl.trim() || selectedPhoto;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newListingId = addListing({
        title: title.trim(),
        description: description.trim(),
        price: dealType === 'Free' ? 0 : Number(price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category,
        dealType,
        condition,
        photos: [activePhoto],
        campusLocation: campusLocation.trim(),
      });

      setIsSubmitting(false);
      setShowSuccessToast(true);

      setTimeout(() => {
        navigate(`/listing/${newListingId}`);
      }, 1000);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create a Campus Listing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            List in under 60 seconds. Reach thousands of verified students at <span className="text-emerald-400 font-semibold">{selectedCollege}</span>.
          </p>
        </div>

        {/* Tab Toggle for Mobile/Desktop */}
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'form' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Listing Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'preview' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Card Preview</span>
          </button>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 flex items-center space-x-3 text-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-300">Listing Published to Campus Network!</p>
            <p className="text-emerald-400/90 text-[11px]">Redirecting you to the listing detail view...</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form View (8 cols on lg or full when tab === 'form') */}
        <div className={`${activeTab === 'preview' ? 'hidden lg:block lg:col-span-7' : 'lg:col-span-7'} space-y-6`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Item Basics */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>1. Item Details</span>
              </h2>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Listing Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casio fx-991CW Scientific Calculator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MockListing['category'])}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5">
                    Condition <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as MockListing['condition'])}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond} className="bg-slate-900 text-white">
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Deal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Sell', 'Rent', 'Exchange', 'Free'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDealType(type)}
                      className={`py-2 text-xs rounded-xl border text-center transition-colors ${
                        dealType === type
                          ? 'bg-emerald-600 text-white border-emerald-500 font-semibold shadow-xs'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Item Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mention age of the item, condition details, semester it was used in, accessories included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-200 outline-none resize-none"
                />
              </div>
            </div>

            {/* 2. Pricing Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Pricing (₹ INR)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5">
                    Your Selling Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      disabled={dealType === 'Free'}
                      min="0"
                      value={dealType === 'Free' ? 0 : price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono outline-none disabled:opacity-50"
                    />
                  </div>
                  {dealType === 'Free' && (
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      Free item for juniors / campus giveaway.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5">
                    Original Store Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1500"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Displays student discount percentage.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Photo & Meetup Location */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>3. Photos & Campus Location</span>
              </h2>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-2">
                  Select a Sample Photo Preset or Provide an Image URL
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {SAMPLE_PHOTO_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(preset.url);
                        setCustomPhotoUrl('');
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhoto === preset.url && !customPhotoUrl
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt="" className="w-full h-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-slate-950/80 text-[9px] text-slate-200 py-0.5 truncate text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or paste custom image link (optional)"
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Campus Handoff Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hostel 16 Common Room, SAC or Central Library Gate"
                    value={campusLocation}
                    onChange={(e) => setCampusLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Public spots like campus cafes or department libraries are recommended.
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm py-3.5 rounded-xl shadow-md shadow-emerald-950 transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing to Campus...' : 'Publish Campus Listing'}</span>
            </button>

          </form>
        </div>

        {/* Live Card Preview Column (5 cols on lg or shown when tab === 'preview') */}
        <div className={`${activeTab === 'form' ? 'hidden lg:block lg:col-span-5' : 'lg:col-span-5'} space-y-4 sticky top-24`}>
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-300 flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Marketplace Card Preview</span>
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">Real-time preview</span>
          </div>

          <div className="max-w-sm mx-auto">
            {/* Mocked Listing Card Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
              <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                <img
                  src={activePhoto}
                  alt={title || 'Item preview'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-800">
                    {category}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/90 backdrop-blur-md text-emerald-300 border border-emerald-800/70">
                    {condition}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-bold text-white">
                    {dealType === 'Free' ? 'FREE' : `₹${Number(price || 0).toLocaleString('en-IN')}`}
                  </span>
                  {originalPrice && Number(originalPrice) > Number(price) && (
                    <span className="text-xs text-slate-500 line-through">
                      ₹{Number(originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">
                  {title || 'Your item title will appear here'}
                </h3>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center space-x-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{campusLocation || 'Campus meetup spot'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-300">{user.fullName} (You)</span>
                    <span className="text-emerald-400 font-mono">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-400 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Your listing will be instantly visible to students at <strong className="text-slate-200">{selectedCollege}</strong>. Students can negotiate directly or propose campus meetups.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
