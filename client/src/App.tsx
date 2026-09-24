import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { SellItemPage } from './pages/SellItemPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SavedItemsPage } from './pages/SavedItemsPage';
import { MyListingsPage } from './pages/MyListingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MarketplaceProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
          {/* Top Navbar */}
          <Navbar />

          {/* Main Routing Content */}
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />
              <Route path="/sell" element={<SellItemPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/saved" element={<SavedItemsPage />} />
              <Route path="/my-listings" element={<MyListingsPage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Fixed Mobile Bottom Bar */}
          <MobileNav />

          {/* Polished Editorial Footer */}
          <Footer />
        </div>
      </MarketplaceProvider>
    </BrowserRouter>
  );
};

export default App;
