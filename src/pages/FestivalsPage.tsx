import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ChevronRight, Heart, Flame } from 'lucide-react';
import { Festival } from '../types';
import { fetchFestivals } from '../services/api';

interface FestivalsPageProps {
  onNavigate: (page: string) => void;
  onSelectPooja: (poojaId: string) => void;
}

export const FestivalsPage: React.FC<FestivalsPageProps> = ({ onNavigate, onSelectPooja }) => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFestivals()
      .then((data) => {
        setFestivals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Temple Calendar
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Grand Festivals & Utsavams
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Witness the divine celebrations of Sri Amman Temple. From the vibrant 10-day Aadi
            Thiruvizha to the celestial wedding of Panguni Uthiram and the nine sacred nights of
            Navaratri.
          </p>
        </div>
      </section>

      {/* Festivals List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-purple-900 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Loading festival calendar...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {festivals.map((fest, idx) => (
              <div
                key={fest.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Festival Image */}
                <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
                  <img
                    src={fest.image}
                    alt={fest.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                    {fest.badge}
                  </div>
                </div>

                {/* Festival Details */}
                <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-purple-900 font-semibold">
                      <span className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                        <Calendar className="w-3.5 h-3.5 text-purple-700" />
                        <span>Dates: {fest.startDate} to {fest.endDate}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Sanctum & Praharam Ula</span>
                    </div>

                    <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-slate-900">
                      {fest.title}
                    </h2>

                    <p className="text-slate-600 text-sm leading-relaxed">
                      {fest.description}
                    </p>

                    {/* Schedule of Events */}
                    {fest.schedule && fest.schedule.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>Key Festival Ceremonies:</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          {fest.schedule.map((item, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      Sponsor Annadhanam or Special Archana for this Utsavam
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate('booking')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-950 border border-purple-200 hover:bg-purple-50 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-purple-800" />
                        <span>Book Festival Archana</span>
                      </button>

                      <button
                        onClick={() => onNavigate('donations')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-950 fill-rose-950" />
                        <span>Sponsor Festival (80G)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
