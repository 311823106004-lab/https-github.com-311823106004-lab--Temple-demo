import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TopMarquee } from './components/TopMarquee';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PoojasPage } from './pages/PoojasPage';
import { BookingPage } from './pages/BookingPage';
import { FestivalsPage } from './pages/FestivalsPage';
import { DonationsPage } from './pages/DonationsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/AdminLogin';
import { TempleInfo, PoojaTiming, AdminUser } from './types';
import { fetchTempleInfo, fetchPoojaTimings, checkAuth, logoutAdmin } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedPoojaId, setSelectedPoojaId] = useState<string | undefined>(undefined);
  const [templeInfo, setTempleInfo] = useState<TempleInfo | null>(null);
  const [poojaTimings, setPoojaTimings] = useState<PoojaTiming[]>([]);

  // Admin Authentication State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Sync route from URL path or query
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      if (path === '/admin' || hash === 'admin') {
        setCurrentPage('admin');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Check auth session
  useEffect(() => {
    checkAuth()
      .then((res) => {
        if (res.authenticated && res.admin) {
          setAdminUser(res.admin);
        }
      })
      .finally(() => setIsCheckingAuth(false));
  }, []);

  // Fetch initial temple metadata
  useEffect(() => {
    fetchTempleInfo()
      .then((data) => setTempleInfo(data))
      .catch((err) => console.error('Error fetching temple info:', err));

    fetchPoojaTimings()
      .then((data) => setPoojaTimings(data))
      .catch((err) => console.error('Error fetching timings:', err));
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPooja = (poojaId: string) => {
    setSelectedPoojaId(poojaId);
  };

  const handleAdminLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
    handleNavigate('home');
  };

  // If on admin route:
  if (currentPage === 'admin') {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-amber-400 rounded-full animate-spin" />
        </div>
      );
    }

    if (!adminUser) {
      return (
        <AdminLogin
          onSuccess={(admin) => setAdminUser(admin)}
          onBackToSite={() => handleNavigate('home')}
        />
      );
    }

    return (
      <AdminLayout
        admin={adminUser}
        onLogout={handleAdminLogout}
        onViewPublicSite={() => handleNavigate('home')}
      />
    );
  }

  // Public Temple Website
  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 antialiased selection:bg-purple-900 selection:text-amber-300">
      {/* Top Announcement Bar */}
      <TopMarquee />

      {/* Main Website Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSelectPoojaForBooking={handleSelectPooja}
      />

      {/* Dynamic Content Views */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            templeInfo={templeInfo}
            poojaTimings={poojaTimings}
            onNavigate={handleNavigate}
            onSelectPooja={handleSelectPooja}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage templeInfo={templeInfo} onNavigate={handleNavigate} />
        )}

        {currentPage === 'poojas' && (
          <PoojasPage onNavigate={handleNavigate} onSelectPooja={handleSelectPooja} />
        )}

        {currentPage === 'booking' && (
          <BookingPage initialPoojaId={selectedPoojaId} onNavigate={handleNavigate} />
        )}

        {currentPage === 'festivals' && (
          <FestivalsPage onNavigate={handleNavigate} onSelectPooja={handleSelectPooja} />
        )}

        {currentPage === 'donations' && (
          <DonationsPage templeInfo={templeInfo} onNavigate={handleNavigate} />
        )}

        {currentPage === 'gallery' && <GalleryPage />}

        {currentPage === 'contact' && <ContactPage templeInfo={templeInfo} />}
      </main>

      {/* Traditional Indian Temple Footer with discrete Admin Access */}
      <Footer templeInfo={templeInfo} onNavigate={handleNavigate} />
    </div>
  );
}
