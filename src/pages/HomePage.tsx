import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Heart,
  Clock,
  MapPin,
  ChevronRight,
  Flame,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Sun,
} from 'lucide-react';
import { TempleInfo, PoojaTiming, Pooja, Festival } from '../types';
import { fetchPoojas, fetchFestivals } from '../services/api';
import { TemplePanoramaViewer } from '../components/TemplePanoramaViewer';

interface HomePageProps {
  templeInfo: TempleInfo | null;
  poojaTimings: PoojaTiming[];
  onNavigate: (page: string) => void;
  onSelectPooja: (poojaId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  templeInfo,
  poojaTimings,
  onNavigate,
  onSelectPooja,
}) => {
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);

  useEffect(() => {
    fetchPoojas().then((data) => setPoojas(data.slice(0, 4))).catch(() => {});
    fetchFestivals().then((data) => setFestivals(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Immersive 360° Temple Hero Banner */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white">
        <TemplePanoramaViewer customImageUrl={templeInfo?.panorama360Url}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-semibold tracking-wider uppercase backdrop-blur-md shadow-lg">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Sri Maha Mariamman Devasthanam • Consecrated 300+ Years</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {templeInfo?.name || 'Sri Amman Temple'}
          </h1>

          <p className="font-serif italic text-base sm:text-lg text-amber-200 max-w-2xl mx-auto drop-shadow-sm">
            "Sarva Mangala Mangalye Sive Sarvartha Sadhike, Saranye Tryambake Gauri Narayani Namostute"
          </p>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            {templeInfo?.tagline ||
              'Sanctuary of Divine Grace, Protection and Eternal Prosperity. Experience the peaceful presence of the Divine Mother in the historic heart of Mylapore.'}
          </p>

          {/* Quick CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('booking')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-xl shadow-purple-950/50 hover:from-purple-700 hover:to-indigo-800 hover:scale-105 transition-all border border-purple-500/40 active:scale-95"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Book Pooja Online</span>
            </button>

            <button
              onClick={() => onNavigate('donations')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-amber-500 text-slate-950 shadow-xl shadow-amber-600/40 hover:bg-amber-400 hover:scale-105 transition-all border border-amber-400 active:scale-95"
            >
              <Heart className="w-4 h-4 text-rose-950 fill-rose-950" />
              <span>Donate (80G Tax Exemption)</span>
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800/90 text-white backdrop-blur-md transition-all border border-white/20 active:scale-95"
            >
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Darshan & Location</span>
            </button>
          </div>

          {/* Quick darshan badge */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 shadow">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Morning: {templeInfo?.openingHours?.morning || '05:30 AM – 12:30 PM'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 shadow">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Evening: {templeInfo?.openingHours?.evening || '04:30 PM – 09:00 PM'}</span>
            </span>
          </div>
        </TemplePanoramaViewer>
      </section>

      {/* Today's Pooja Timings Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-purple-50 text-purple-900">
                  <Sun className="w-5 h-5 text-amber-600" />
                </span>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-slate-900">
                  Daily Kaala Pooja Timings
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Performed according to strict Vedic Saiva & Shakta Agamic traditions every day.
              </p>
            </div>
            <button
              onClick={() => onNavigate('poojas')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-purple-900 hover:text-purple-700 group"
            >
              <span>View All Sevas & Bookings</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {poojaTimings.map((timing, idx) => (
              <div
                key={timing.id || idx}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/40 hover:border-purple-200 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                    {timing.name}
                  </span>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                    {timing.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {timing.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temple Overview & Sthalam Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Image Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="space-y-3.5">
              <img
                src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80"
                alt="Temple Lamps"
                className="w-full h-48 sm:h-56 object-cover rounded-2xl shadow-md border border-purple-100"
              />
              <div className="bg-gradient-to-br from-purple-950 to-indigo-950 p-5 rounded-2xl text-white shadow-md space-y-1">
                <span className="font-cinzel text-3xl font-black text-amber-400">300+</span>
                <p className="text-xs text-purple-200 font-medium">Years of Consecrated Sacred Heritage</p>
              </div>
            </div>
            <div className="space-y-3.5 pt-6">
              <div className="bg-amber-500 p-5 rounded-2xl text-slate-950 shadow-md space-y-1">
                <span className="font-cinzel text-3xl font-black text-slate-950">5</span>
                <p className="text-xs text-slate-900 font-semibold">Daily Agamic Kaala Poojas</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80"
                alt="Devotional Alankaram"
                className="w-full h-48 sm:h-56 object-cover rounded-2xl shadow-md border border-purple-100"
              />
            </div>
          </div>

          {/* Text Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
                Sacred Sthala Puranam
              </span>
              <h2 className="font-cinzel text-2xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Sanctuary of Healing, Divine Protection & Maternal Grace
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {templeInfo?.history ||
                'Sri Amman Temple is an ancient, revered sanctuary consecrated over 300 years ago. Dedicated to Sri Maha Mariamman, the supreme goddess of healing, rain, prosperity, and spiritual liberation.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <ShieldCheck className="w-5 h-5 text-purple-800 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-purple-950">Swayambhu Moolavar</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Self-manifested trident and divine stone moolavar venerated since the 17th century.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <Users className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">Nitya Annadhanam</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Free consecrated hot satvik meals served daily to hundreds of visiting pilgrims.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-purple-950 text-white hover:bg-purple-900 transition-colors shadow"
              >
                <span>Read Full Temple History & Deities</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pooja Services Section */}
      <section className="bg-gradient-to-b from-purple-50/60 to-white py-14 border-y border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Devotee Offerings & Sevas
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-900">
              Sacred Poojas & Archanas
            </h2>
            <p className="text-sm text-slate-600">
              Book special archanas, abhishekam, and homams performed in your family name and gotram.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {poojas.map((pooja) => (
              <div
                key={pooja.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-purple-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
                      {pooja.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {pooja.duration}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-slate-900 leading-snug">
                    {pooja.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {pooja.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Dakshina
                    </span>
                    <span className="font-cinzel text-xl font-bold text-amber-700">
                      ₹{pooja.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onSelectPooja(pooja.id);
                      onNavigate('booking');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-950 text-white hover:bg-purple-900 transition-colors shadow-xs"
                  >
                    <span>Book Now</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('poojas')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-purple-950 border-2 border-purple-950 hover:bg-purple-50 transition-colors"
            >
              <span>Explore All {poojas.length > 0 ? 'Pooja Services' : 'Services'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Upcoming Festivals Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">
              Sacred Calendar
            </span>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-900">
              Upcoming Grand Festivals
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Participate in vibrant annual utsavams, milk pot processions, and celestial celebrations.
            </p>
          </div>
          <button
            onClick={() => onNavigate('festivals')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-900 hover:text-purple-700"
          >
            <span>View Complete Festival Calendar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {festivals.map((festival) => (
            <div
              key={festival.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={festival.image}
                  alt={festival.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-400/30">
                  {festival.badge}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Starts: {festival.startDate}</span>
                  </div>
                  <h3 className="font-cinzel text-lg font-bold text-slate-900 group-hover:text-purple-950 transition-colors">
                    {festival.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {festival.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('festivals')}
                    className="text-xs font-bold text-purple-950 hover:text-amber-600 transition-colors flex items-center gap-1"
                  >
                    <span>View Schedule</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('donations')}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Sponsor Festival Seva
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Donation Banner (Annadhanam & 80G Tax Exemption) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 border-2 border-amber-400 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/40">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Nitya Annadhanam & Temple Renovation Trust</span>
            </span>

            <h2 className="font-cinzel text-2xl sm:text-4xl font-black text-white leading-tight">
              Feed 100 Devotees or Contribute to Temple Renovation
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              "Annam Para Brahma Swaroopam" — Annadhanam is considered the highest of all offerings.
              All contributions made to Sri Amman Temple Charitable Trust are 100% tax exempt under
              Section 80G. An official digital receipt is instantly generated upon verified payment.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('donations')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition-all active:scale-95"
              >
                <Heart className="w-4 h-4 text-rose-950 fill-rose-950" />
                <span>Make a Divine Contribution</span>
              </button>
              <div className="text-xs text-amber-200/90 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant 80G Tax Receipt Issued with Government URN</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
