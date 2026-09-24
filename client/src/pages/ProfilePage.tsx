import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  Edit3
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { MOCK_REVIEWS } from '../data/mockData';
import { ListingCard } from '../components/marketplace/ListingCard';

export const ProfilePage: React.FC = () => {
  const { user, listings } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'reviews' | 'listings' | 'verification'>('reviews');

  const myListings = listings.filter((item) => item.seller.id === user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg"
            />

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user.fullName}</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Student</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium flex items-center space-x-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.branch} • Batch of {user.graduationYear}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{user.hostel}, {user.college}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Joined {user.joinedDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit */}
          <button
            type="button"
            onClick={() => alert("Profile updates are synced with your university registrar in Phase 2!")}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

        </div>

        {/* Bio */}
        <p className="mt-5 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed font-normal">
          {user.bio}
        </p>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-emerald-400 font-extrabold text-lg sm:text-xl font-mono block">
              {user.trustScore}/100
            </span>
            <span className="text-[11px] text-slate-400">Trust Score</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              {user.rating} ★
            </span>
            <span className="text-[11px] text-slate-400">Rating ({user.reviewsCount} reviews)</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              {user.itemsSold}
            </span>
            <span className="text-[11px] text-slate-400">Items Sold</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              {user.meetupSuccessRate}%
            </span>
            <span className="text-[11px] text-slate-400">Handshake Completion</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'reviews'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Peer Reviews ({MOCK_REVIEWS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'listings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Active Listings ({myListings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verification')}
          className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'verification'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Verification</span>
        </button>
      </div>

      {/* Tab 1: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {MOCK_REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={rev.reviewerAvatar}
                    alt={rev.reviewerName}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">{rev.reviewerName}</span>
                    <span className="text-[11px] text-slate-400">{rev.reviewerBranch}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                    <span>{rev.rating}.0</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{rev.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1">
                "{rev.comment}"
              </p>

              <div className="pt-2 text-[10px] text-slate-500 flex items-center space-x-1 font-mono">
                <ShoppingBag className="w-3 h-3 text-slate-600" />
                <span>Purchased: {rev.itemTitle}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: My Listings */}
      {activeTab === 'listings' && (
        <div>
          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              You haven't posted any active listings yet. Click "+ Sell Item" above to get started.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Verification */}
      {activeTab === 'verification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Campus Credential Audit</h3>

          <div className="divide-y divide-slate-800 text-xs space-y-3">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-medium block">Institutional Email Domain</span>
                <span className="text-[11px] text-slate-500">{user.email}</span>
              </div>
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified</span>
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-medium block">Student ID Roll Number</span>
                <span className="text-[11px] text-slate-500">{user.studentId} ({user.college})</span>
              </div>
              <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active</span>
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-slate-300 font-medium block">Campus Safety Conduct Score</span>
                <span className="text-[11px] text-slate-500">0 community flags • 100% on-time meetups</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">100 / 100</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
