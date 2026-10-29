import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { TempleInfo } from '../types';

interface FooterProps {
  templeInfo: TempleInfo | null;
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ templeInfo, onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t-4 border-amber-500">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Temple Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-800 to-amber-600 flex items-center justify-center text-amber-200 border border-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-xl font-bold text-white tracking-wide">
                  {templeInfo?.name || 'Sri Amman Temple'}
                </h3>
                <p className="text-xs text-amber-400 font-medium">Sri Maha Mariamman Devasthanam</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {templeInfo?.tagline ||
                'Sanctuary of Divine Grace, Protection and Spiritual Elevation. Consecrated with eternal Vedic Agamic traditions.'}
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-800/60 rounded-lg px-3 py-2 text-xs text-purple-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  Reg. Trust: {templeInfo?.trustDetails?.regNo || 'TN/HRCE/1959/TR-4892'}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-cinzel text-base font-semibold text-white tracking-wider uppercase border-b border-purple-900/60 pb-2">
              Devotee Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('poojas')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Daily Pooja & Archanas</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('booking')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Online Pooja Booking</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('donations')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Nitya Annadhanam (80G)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('festivals')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Upcoming Festival Calendar</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Temple Photo Gallery</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="flex items-center gap-2 text-slate-400 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sthala Puranam & Deities</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Darshan & Timings */}
          <div className="space-y-4">
            <h4 className="font-cinzel text-base font-semibold text-white tracking-wider uppercase border-b border-purple-900/60 pb-2">
              Darshan Timings
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Morning Darshan</p>
                  <p className="text-slate-400 text-xs">
                    {templeInfo?.openingHours?.morning || '05:30 AM – 12:30 PM'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Evening Darshan</p>
                  <p className="text-slate-400 text-xs">
                    {templeInfo?.openingHours?.evening || '04:30 PM – 09:00 PM'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
                <p className="text-amber-400 font-semibold mb-1">Friday Special Darshan</p>
                <p>Morning 10:30 AM – 12:00 PM & Evening 03:00 PM – 04:30 PM Rahu Kalam Deepam.</p>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Sanctum Address */}
          <div className="space-y-4">
            <h4 className="font-cinzel text-base font-semibold text-white tracking-wider uppercase border-b border-purple-900/60 pb-2">
              Sanctum Location
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-slate-300 leading-relaxed">
                  {templeInfo?.location ||
                    'No. 48, Sannadhi Street, Mylapore, Chennai, Tamil Nadu 600004'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`tel:${templeInfo?.phone || '+914424987654'}`}
                  className="text-slate-300 hover:text-amber-300 transition-colors"
                >
                  {templeInfo?.phone || '+91 44 2498 7654'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a
                  href={`mailto:${templeInfo?.email || 'darshan@sriamman.org'}`}
                  className="text-slate-300 hover:text-amber-300 transition-colors"
                >
                  {templeInfo?.email || 'darshan@sriamman.org'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with discrete Admin Login */}
      <div className="border-t border-slate-900 bg-black/40 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>
              © {new Date().getFullYear()} {templeInfo?.name || 'Sri Amman Temple'} Trust. All Rights
              Reserved. (Demo Project)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-slate-400 transition-colors"
            >
              Directions
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-slate-400 transition-colors"
            >
              Temple Rules & Dress Code
            </button>
            <span>•</span>
            {/* Discrete Admin Portal entry (not in main nav, accessed directly or via footer) */}
            <button
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-all"
              title="Official Temple Administration Portal"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Temple Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
