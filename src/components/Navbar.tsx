import React, { useState } from 'react';
import {
  Menu,
  X,
  Calendar,
  Heart,
  Flame,
  Clock,
  Phone,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSelectPoojaForBooking?: (poojaId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Temple' },
    { id: 'poojas', label: 'Pooja & Services' },
    { id: 'booking', label: 'Online Booking' },
    { id: 'festivals', label: 'Festivals' },
    { id: 'donations', label: 'Donations' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact & Location' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm transition-all duration-200">
      {/* Top micro bar with temple darshan timings & helpline */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-1.5 px-6 border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Darshan Hours: 05:30 AM – 12:30 PM & 04:30 PM – 09:00 PM</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 flex items-center gap-1">
              <span>Sthalam: Mylapore, Chennai, Tamil Nadu</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="tel:+914424987654"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Helpdesk: +91 44 2498 7654</span>
            </a>
            <span className="bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded text-[11px] font-medium border border-purple-700/50">
              80G Tax Exemption Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Temple Emblem and Name */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-900 to-amber-700 flex items-center justify-center shadow-md shadow-purple-950/20 group-hover:scale-105 transition-transform duration-200 border-2 border-amber-400">
              <Flame className="w-6 h-6 text-amber-300" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[9px] font-bold text-slate-900 shadow">
                OM
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors">
                  Sri Amman Temple
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                  Demo Project
                </span>
              </div>
              <p className="text-xs text-purple-900/75 tracking-wide font-medium">
                Sri Maha Mariamman Devasthanam • Mylapore
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 relative ${
                    isActive
                      ? 'text-purple-950 font-semibold bg-purple-50'
                      : 'text-slate-600 hover:text-purple-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-700 to-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Action CTA Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handleNav('booking')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-sm hover:from-purple-800 hover:to-indigo-800 transition-all hover:shadow active:scale-95 border border-purple-700/30"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Book Pooja</span>
            </button>
            <button
              onClick={() => handleNav('donations')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition-all hover:shadow active:scale-95 border border-amber-400"
            >
              <Heart className="w-4 h-4 text-rose-900 fill-rose-900" />
              <span>Donate</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => handleNav('booking')}
              className="sm:hidden inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold bg-purple-900 text-white"
            >
              Book Pooja
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-purple-950 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-purple-100 shadow-xl transition-all">
          <div className="px-4 pt-3 pb-6 space-y-1.5 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-950 text-amber-300 font-semibold'
                      : 'text-slate-700 hover:bg-purple-50 hover:text-purple-950'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`}
                  />
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => handleNav('booking')}
                className="w-full py-3 rounded-lg text-center font-semibold bg-purple-950 text-white flex items-center justify-center gap-2 shadow"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                Book Pooja Online
              </button>
              <button
                onClick={() => handleNav('donations')}
                className="w-full py-3 rounded-lg text-center font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow"
              >
                <Heart className="w-4 h-4 text-rose-900 fill-rose-900" />
                Make a Divine Donation (80G)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
