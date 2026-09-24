import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  MapPin, 
  PlusCircle
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ListingCard } from '../components/marketplace/ListingCard';
import { CategoryBar } from '../components/marketplace/CategoryBar';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { listings, selectedCollege, setSearchQuery } = useMarketplace();

  const handleQuickTagSearch = (tag: string) => {
    setSearchQuery(tag);
    navigate('/marketplace');
  };

  const featuredListings = listings.slice(0, 4);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="card-surface rounded-3xl p-6 sm:p-12 lg:p-16 border border-slate-800 relative overflow-hidden">
          
          {/* Subtle Background Radial */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            
            {/* Campus Tag */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-emerald-400">{selectedCollege} Active Network</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">100% Verified Students</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                The trusted marketplace for campus life.
              </h1>
              <p className="text-emerald-400 font-semibold text-lg sm:text-xl tracking-tight">
                Buy. Sell. Rent. Exchange.
              </p>
            </div>

            {/* Subhead */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
              Verified students. Smarter prices. Safer deals. Buy and pass down textbooks, cycles, calculators, and hostel essentials within your campus.
            </p>

            {/* Quick Hero Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all"
              >
                <span>Browse Campus Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/sell"
                className="inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>List an Item in 60s</span>
              </Link>
            </div>

            {/* Popular Campus Searches */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-500 font-medium">Trending on campus:</span>
              {['Scientific Calculator', 'Cycle', 'B.S. Grewal', 'Induction Stove', 'Drafter', 'Bed Table'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTagSearch(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Category Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Everything you need from 1st Year to Final Year</p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <CategoryBar />
      </section>

      {/* Featured Campus Deals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Recent Campus Drops</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Handpicked listings from students at {selectedCollege}</p>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            Explore 12+ Items &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Safe Campus Trading Model */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-surface rounded-2xl p-8 sm:p-10 border border-slate-800">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800">
              Campus Trust Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-3">
              How Safe Campus Trading Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal leading-relaxed">
              Public marketplaces are filled with strangers, delivery scams, and fake profiles. Collex is closed to the public and limited to verified peers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/90 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">1. Verified Student Accounts</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Registration requires an official university email (<code className="text-slate-300">@iitb.ac.in</code>, <code className="text-slate-300">@bits-pilani.ac.in</code>). No outsiders or spammers allowed.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/90 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">2. In-Campus Physical Handoff</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                No courier fees or shipping anxiety. Meet your fellow student at the Central Library, SAC, or Hostel Mess to inspect the item in person.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/90 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">3. Verified Handshake & Trust</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Inspect before paying. Post-transaction reviews and student trust scores guarantee accountability across batches and semesters.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Campus Circular Economy Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Finished with your semester textbooks or lab gear?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              Pass them down to juniors instead of letting them collect dust in your hostel cupboard. Make cash back or giveaway free stuff to peers who need it.
            </p>
          </div>

          <Link
            to="/sell"
            className="shrink-0 inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Campus Listing</span>
          </Link>
        </div>
      </section>

    </div>
  );
};
