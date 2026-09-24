import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const MobileNav: React.FC = () => {
  const { conversations } = useMarketplace();
  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center space-y-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/marketplace"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center space-y-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </NavLink>

        <NavLink
          to="/sell"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center text-[10px] font-medium transition-all ${
              isActive ? 'text-emerald-300' : 'text-emerald-400 hover:text-emerald-300'
            }`
          }
        >
          <div className="w-10 h-10 -mt-5 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950 flex items-center justify-center text-white ring-4 ring-slate-950">
            <PlusCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="mt-0.5 font-semibold">Sell</span>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }: { isActive: boolean }) =>
            `relative flex flex-col items-center space-y-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span>Chat</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }: { isActive: boolean }) =>
            `flex flex-col items-center space-y-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </div>
  );
};
