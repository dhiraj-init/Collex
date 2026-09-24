import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Bell, 
  Bookmark, 
  MessageSquare, 
  MapPin, 
  ChevronDown, 
  User, 
  Package, 
  LogOut, 
  CheckCircle2,
  ShieldCheck,
  X
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_COLLEGES } from '../../data/mockData';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { 
    searchQuery, 
    setSearchQuery, 
    savedListingIds, 
    selectedCollege, 
    setSelectedCollege, 
    notifications, 
    markNotificationAsRead,
    unreadNotificationsCount
  } = useMarketplace();

  const [isCollegeMenuOpen, setIsCollegeMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const collegeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collegeRef.current && !collegeRef.current.contains(e.target as Node)) {
        setIsCollegeMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (location.pathname !== '/marketplace') {
      navigate('/marketplace');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Brand Logo & Campus Switcher */}
          <div className="flex items-center space-x-3 shrink-0">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-emerald-950 group-hover:scale-105 transition-transform">
                C
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Collex
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    Campus
                  </span>
                </span>
              </div>
            </Link>

            {/* Campus Selector Dropdown */}
            <div className="relative" ref={collegeRef}>
              <button
                type="button"
                onClick={() => setIsCollegeMenuOpen(!isCollegeMenuOpen)}
                className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Filter by your college campus"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-medium max-w-[110px] sm:max-w-[150px] truncate">{selectedCollege}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCollegeMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Select Your University
                  </div>
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {MOCK_COLLEGES.map((college) => (
                      <button
                        key={college.id}
                        type="button"
                        onClick={() => {
                          setSelectedCollege(college.shortName);
                          setIsCollegeMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                          selectedCollege === college.shortName
                            ? 'bg-emerald-950/60 text-emerald-300 font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{college.shortName}</div>
                          <div className="text-[11px] text-slate-500">{college.city}, {college.state}</div>
                        </div>
                        {selectedCollege === college.shortName && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search textbooks, cycles, calculators, dorm gear..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch('');
                    setSearchQuery('');
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Navigation & Action CTAs */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Explore Marketplace Link */}
            <Link
              to="/marketplace"
              className={`hidden lg:inline-flex items-center text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/marketplace'
                  ? 'text-emerald-400 bg-slate-900'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Marketplace
            </Link>

            {/* "+ Sell" Button */}
            <Link
              to="/sell"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs px-3 sm:px-3.5 py-2 rounded-lg shadow-sm shadow-emerald-950 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="font-semibold">Sell Item</span>
            </Link>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-white">Campus Notifications</span>
                    <span className="text-[11px] text-emerald-400 font-mono">{unreadNotificationsCount} new</span>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer transition-colors ${
                          notif.isRead ? 'opacity-70 hover:bg-slate-800/40' : 'bg-slate-800/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200">{notif.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{notif.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 px-3 pb-1 border-t border-slate-800 text-center">
                    <Link
                      to="/messages"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      View all chat & meetup notifications &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Saved Items Link */}
            <Link
              to="/saved"
              className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors hidden sm:inline-flex"
              title="Saved Items"
              aria-label="Saved items"
            >
              <Bookmark className="w-4 h-4" />
              {savedListingIds.size > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700 h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center font-mono">
                  {savedListingIds.size}
                </span>
              )}
            </Link>

            {/* Messages Chat Link */}
            <Link
              to="/messages"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors hidden sm:inline-flex"
              title="Campus Messages"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileRef}>
            {/* Profile Menu Dropdown or Auth Links */}
            {isAuthenticated && authUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                  aria-label="User profile menu"
                >
                  <img
                    src={authUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={authUser.fullName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/50"
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* User Header */}
                    <div className="px-3 py-2.5 border-b border-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-xs text-white truncate">{authUser.fullName}</span>
                        <span title={authUser.verificationStatus || 'Verified Student'}>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{authUser.email}</div>
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          {authUser.verificationStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Trust: {authUser.trustScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1 text-xs">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Student Profile</span>
                      </Link>

                      <Link
                        to="/my-listings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Listings & Trades</span>
                      </Link>

                      <Link
                        to="/wanted"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Wanted Board</span>
                      </Link>

                      {(authUser.role === 'COLLEGE_ADMIN' || authUser.role === 'SUPER_ADMIN') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-emerald-400 hover:bg-emerald-950/30 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Campus Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/saved"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors sm:hidden"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Items ({savedListingIds.size})</span>
                      </Link>

                      <Link
                        to="/messages"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors sm:hidden"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span>Messages</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/30 text-xs transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};
