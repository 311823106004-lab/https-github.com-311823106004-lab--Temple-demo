import React from 'react';
import { X, Printer, CheckCircle2, Calendar, Clock, Flame, Shield, MapPin, User, Sparkles } from 'lucide-react';
import { Booking } from '../types';

interface BookingPassModalProps {
  booking: Booking | null;
  onClose: () => void;
}

export const BookingPassModal: React.FC<BookingPassModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden my-8">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="no-print absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-wide text-white">
                  Sri Amman Temple
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded uppercase">
                  Confirmed Pass
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                Official Pooja Booking & e-Darshan Voucher
              </p>
              <p className="text-[11px] text-purple-200">
                Sannadhi Street, Mylapore, Chennai • Ph: +91 44 2498 7654
              </p>
            </div>
          </div>
        </div>

        {/* Pass Body (Printable Area) */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 bg-[#fffdfa]">
          {/* Reference Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                Booking Reference Number
              </span>
              <p className="text-2xl font-mono font-bold text-purple-950 tracking-wider">
                {booking.bookingRef}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{booking.status.toUpperCase()}</span>
            </div>
          </div>

          {/* Pooja & Schedule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Pooja Service</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{booking.poojaName}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Dakshina / Seva Amount</span>
              <p className="text-base font-bold text-amber-700 mt-0.5">₹{booking.amount.toLocaleString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-700" />
              <div>
                <span className="text-xs text-slate-500 block">Pooja Date</span>
                <span className="text-sm font-semibold text-slate-900">{booking.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-700" />
              <div>
                <span className="text-xs text-slate-500 block">Scheduled Time</span>
                <span className="text-sm font-semibold text-slate-900">{booking.timeSlot}</span>
              </div>
            </div>
          </div>

          {/* Devotee & Sankalpam Details */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-purple-700" />
              <span>Devotee & Sankalpam Particulars</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Devotee Name</span>
                <span className="font-semibold text-slate-900">{booking.devoteeName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Mobile Phone</span>
                <span className="font-mono text-slate-900">{booking.phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Email Address</span>
                <span className="text-slate-900">{booking.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Gotram / Kulam</span>
                <span className="font-medium text-slate-900">{booking.gotram || 'Siva Gotram'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Nakshatra & Rasi</span>
                <span className="font-medium text-slate-900">
                  {booking.nakshatra ? `${booking.nakshatra} (${booking.rasi || 'Rasi'})` : 'As per Sankalpam'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Prasadam Mode</span>
                <span className="font-medium text-purple-900 capitalize">
                  {booking.prasadDelivery === 'postal' ? 'Postal Courier Delivery' : 'In-Person at Temple Sanctum'}
                </span>
              </div>
              {booking.sankalpamNames && (
                <div className="sm:col-span-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                  <span className="text-xs font-semibold text-amber-900 block">Sankalpam Family Names:</span>
                  <span className="text-xs text-slate-800 font-medium">{booking.sankalpamNames}</span>
                </div>
              )}
            </div>
          </div>

          {/* Devotee Guidelines */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Temple Darshan Guidelines:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Please report to the temple administrative office 20 minutes prior to scheduled pooja time.</li>
              <li>Show this digital voucher on your mobile or present a printed copy at the sanctum entrance.</li>
              <li>Strict Agamic traditional dress code is mandatory (Dhoti/Kurta for Men; Saree/Chudidhar for Women).</li>
            </ul>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="no-print bg-slate-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Booking preserved securely in Sri Amman Temple database.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-purple-950 text-white hover:bg-purple-900 shadow transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Print / Download Voucher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
