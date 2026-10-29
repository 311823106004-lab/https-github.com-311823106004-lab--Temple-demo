import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X } from 'lucide-react';
import { Announcement } from '../types';
import { fetchAnnouncements } from '../services/api';

export const TopMarquee: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    fetchAnnouncements()
      .then((data) => setAnnouncements(data))
      .catch(() => {
        // Fallback announcement
        setAnnouncements([
          {
            id: 'default',
            text: 'Special Friday Rahu Kalam Deeparadhana at 10:30 AM & 3:00 PM. All pooja bookings are now online.',
            isImportant: true,
            date: '2026-10-22',
          },
        ]);
      });
  }, []);

  if (closed || announcements.length === 0) return null;

  const current = announcements[0];

  return (
    <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-amber-300 text-xs sm:text-sm px-4 py-2 border-b border-amber-500/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-xs font-semibold tracking-wider uppercase border border-amber-400/30">
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Notice
          </span>
          <p className="truncate text-amber-100 font-medium tracking-wide">
            {current.text}
          </p>
        </div>
        <button
          onClick={() => setClosed(true)}
          className="text-amber-300/70 hover:text-white transition-colors p-0.5 flex-shrink-0"
          title="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
