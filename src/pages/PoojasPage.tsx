import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Pooja } from '../types';
import { fetchPoojas } from '../services/api';

interface PoojasPageProps {
  onNavigate: (page: string) => void;
  onSelectPooja: (poojaId: string) => void;
}

export const PoojasPage: React.FC<PoojasPageProps> = ({ onNavigate, onSelectPooja }) => {
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPoojas()
      .then((data) => {
        setPoojas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = [
    'All',
    'Daily Archana',
    'Abhishekam',
    'Special Pooja',
    'Homam & Yagna',
    'Astrological Pooja',
    'Grand Utsavam',
    'Seva',
  ];

  const filteredPoojas = poojas.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.benefits && p.benefits.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleBook = (id: string) => {
    onSelectPooja(id);
    onNavigate('booking');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Sacred Offerings & Sevas
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Pooja Services & Archanas
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Select from our sacred list of Agamic rituals, Thirumanjanam abhishekam, and Chandi
            Homams. All poojas are performed by Vedic priests with your family gotram and nakshatram.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filters and Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search poojas, benefits, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-950 text-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Poojas Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-900 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Loading sacred pooja services...</p>
          </div>
        ) : filteredPoojas.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <Flame className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No poojas found</h3>
            <p className="text-sm text-slate-500">
              Try adjusting your category filter or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-purple-900 underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPoojas.map((pooja) => (
              <div
                key={pooja.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      {pooja.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-purple-700" />
                      <span>{pooja.duration}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-slate-900 leading-snug">
                      {pooja.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {pooja.description}
                    </p>
                  </div>

                  {pooja.benefits && (
                    <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
                      <span className="font-semibold text-amber-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Spiritual Significance & Benefits:</span>
                      </span>
                      <p className="text-slate-700 leading-normal">{pooja.benefits}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Availability: {pooja.availableDays}</span>
                  </div>
                </div>

                <div className="p-6 pt-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Dakshina / Seva Fee
                    </span>
                    <span className="font-cinzel text-2xl font-black text-amber-700">
                      ₹{pooja.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBook(pooja.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-950 text-white hover:bg-purple-900 shadow transition-all active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>Book This Pooja</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Assistance Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-purple-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-800">
          <div className="space-y-1.5">
            <h3 className="font-cinzel text-xl font-bold text-amber-300">
              Need assistance with Gotram, Nakshatram or Auspicious Muhurtham?
            </h3>
            <p className="text-xs sm:text-sm text-purple-200">
              Our temple Sivachariyars and administrative office are available to guide you in
              selecting the best pooja day.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Contact Temple Priests
          </button>
        </div>
      </section>
    </div>
  );
};
