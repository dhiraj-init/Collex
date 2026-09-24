/* oxlint-disable react/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Package, 
  ShoppingBag, 
  Calendar, 
  GraduationCap, 
  Edit3,
  Award,
  AlertTriangle,
  Check
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/transactionService';
import type { UserTrustProfile } from '../services/transactionService';
import { MOCK_REVIEWS } from '../data/mockData';
import { ListingCard } from '../components/marketplace/ListingCard';

export const ProfilePage: React.FC = () => {
  const { user: mockUser, listings } = useMarketplace();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'listings' | 'trust'>('trust');
  const [trustProfile, setTrustProfile] = useState<UserTrustProfile | null>(null);

  const user = authUser || mockUser;
  const myListings = listings.filter((item) => item.seller.id === user.id || item.seller.name === user.fullName);

  useEffect(() => {
    if (user?.id) {
      transactionService.getTrustProfile(user.id)
        .then((profile) => setTrustProfile(profile))
        .catch(() => {});
    }
  }, [user?.id]);

  const trustScore = trustProfile?.trustScore || user.trustScore || 85;
  const badges = trustProfile?.badges || [
    'College Verified',
    '8 Successful Deals',
    '4.9 Seller Rating',
    'Member Since 2026',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt={user.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-emerald-500/60 shadow-lg"
            />

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{user.fullName}</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.verificationStatus || 'Verified Student'}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium flex items-center space-x-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.branch} • Batch of {user.graduationYear}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{user.college}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Student ID Verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit */}
          <button
            type="button"
            onClick={() => alert("Profile credentials are confirmed with university domain verification.")}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Campus Settings</span>
          </button>

        </div>

        {/* Badges Pill Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-medium text-slate-300 shadow-xs"
            >
              <Award className="w-3 h-3 text-emerald-400" />
              <span>{badge}</span>
            </span>
          ))}
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-emerald-400 font-extrabold text-lg sm:text-xl font-mono block">
              {trustScore}/100
            </span>
            <span className="text-[11px] text-slate-400">Explainable Trust Score</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              4.9 ★
            </span>
            <span className="text-[11px] text-slate-400">Rating (18 reviews)</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              {myListings.length}
            </span>
            <span className="text-[11px] text-slate-400">Campus Listings</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-white font-extrabold text-lg sm:text-xl font-mono block">
              100%
            </span>
            <span className="text-[11px] text-slate-400">Meetup Success Rate</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('trust')}
          className={`pb-3 transition-colors border-b-2 flex items-center space-x-2 ${
            activeTab === 'trust'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust Score Signals</span>
        </button>

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
          <span>My Listings ({myListings.length})</span>
        </button>
      </div>

      {/* Tab 1: Trust Score Breakdown & Safety Layer */}
      {activeTab === 'trust' && (
        <div className="space-y-6">
          
          {/* Explainable Signals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Explainable Trust Calculation</h3>
                <p className="text-xs text-slate-400">
                  Collex calculates trust deterministically using verified signals instead of arbitrary metrics.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs font-bold">
                Tier: {trustProfile?.tierLabel || 'Verified Peer'}
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs space-y-3 pt-2">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Student Verification</span>
                  <span className="text-[11px] text-slate-400">
                    {trustProfile?.signals.verification.description || 'Verified College Email and University Affiliation'}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  +{trustProfile?.signals.verification.points || 35} / 50 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Clean Campus Meetups</span>
                  <span className="text-[11px] text-slate-400">
                    {trustProfile?.signals.completedDeals.description || 'Completed physical peer handoffs with mutual confirmation'}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  +{trustProfile?.signals.completedDeals.points || 16} / 20 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Peer Reviews & Accuracy</span>
                  <span className="text-[11px] text-slate-400">
                    {trustProfile?.signals.peerRatings.description || '4.9/5.0 average rating across all transactions'}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  +{trustProfile?.signals.peerRatings.points || 19} / 20 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Campus Longevity</span>
                  <span className="text-[11px] text-slate-400">
                    {trustProfile?.signals.campusLongevity.description || 'Established campus member'}
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">
                  +{trustProfile?.signals.campusLongevity.points || 7} / 10 pts
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Community Conduct & Safety</span>
                  <span className="text-[11px] text-slate-400">
                    0 cancellations • Zero confirmed safety reports
                  </span>
                </div>
                <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold text-[11px]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Clean Record</span>
                </span>
              </div>
            </div>
          </div>

          {/* Campus In-Person Safety Guidance Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">In-Person Campus Safety Guidelines</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Collex connects verified students within university borders. While institutional domain verification eliminates anonymous external actors, Collex does not guarantee transactions. Follow these guidelines:
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
              <li>Always meet in public campus spots during daylight hours (e.g., Central Library, Student Activity Centre, or Department lobbies).</li>
              <li>Inspect physical textbooks, calculators, and electronics thoroughly before confirming the handoff.</li>
              <li>Keep all communication inside Collex trade chat so an audit trail exists in case of disputes.</li>
              <li>Report any suspicious behavior immediately to campus moderators.</li>
            </ul>
          </div>

        </div>
      )}

      {/* Tab 2: Reviews */}
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

      {/* Tab 3: My Listings */}
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

    </div>
  );
};
