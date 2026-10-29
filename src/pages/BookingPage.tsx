import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  MapPin,
  Flame,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Pooja, Booking } from '../types';
import { fetchPoojas, createBooking, lookupBooking } from '../services/api';
import { BookingPassModal } from '../components/BookingPassModal';

interface BookingPageProps {
  initialPoojaId?: string;
  onNavigate: (page: string) => void;
}

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const RASIS = [
  'Mesham (Aries)', 'Rishabham (Taurus)', 'Mithunam (Gemini)', 'Kadagam (Cancer)',
  'Simham (Leo)', 'Kanni (Virgo)', 'Thulaam (Libra)', 'Vrischikam (Scorpio)',
  'Dhanusu (Sagittarius)', 'Makaram (Capricorn)', 'Kumbham (Aquarius)', 'Meenam (Pisces)'
];

const TIME_SLOTS = [
  '07:30 AM (Kaalasanthi Pooja)',
  '09:30 AM (Morning Special Archana)',
  '11:30 AM (Uchikkaala Thirumanjanam)',
  '05:30 PM (Sayaratchai Deeparadhana)',
  '07:00 PM (Special Alankara Darshan)',
  '08:00 PM (Arthajaama Pooja)'
];

export const BookingPage: React.FC<BookingPageProps> = ({ initialPoojaId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [loadingPoojas, setLoadingPoojas] = useState(true);

  // Form State
  const [devoteeName, setDevoteeName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [poojaId, setPoojaId] = useState(initialPoojaId || '');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [gotram, setGotram] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [rasi, setRasi] = useState('');
  const [sankalpamNames, setSankalpamNames] = useState('');
  const [prasadDelivery, setPrasadDelivery] = useState<'temple' | 'postal'>('temple');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Status & modal states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackingResults, setTrackingResults] = useState<Booking[] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    fetchPoojas()
      .then((data) => {
        setPoojas(data);
        if (!poojaId && data.length > 0) {
          setPoojaId(data[0].id);
        }
        setLoadingPoojas(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingPoojas(false);
      });
  }, []);

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const selectedPooja = poojas.find((p) => p.id === poojaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!devoteeName || !phone || !email || !poojaId || !date) {
      setErrorMessage('Please fill in all mandatory fields (Name, Phone, Email, Pooja, Date).');
      return;
    }

    if (prasadDelivery === 'postal' && !address) {
      setErrorMessage('Please provide your complete postal mailing address for prasad dispatch.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        devoteeName,
        phone,
        email,
        poojaId,
        poojaName: selectedPooja ? selectedPooja.title : 'Special Temple Pooja',
        amount: selectedPooja ? selectedPooja.price : 101,
        date,
        timeSlot,
        gotram,
        nakshatra,
        rasi,
        sankalpamNames,
        prasadDelivery,
        address,
        notes,
      });

      setConfirmedBooking(res.booking);
      // Reset form
      setDevoteeName('');
      setPhone('');
      setEmail('');
      setGotram('');
      setNakshatra('');
      setRasi('');
      setSankalpamNames('');
      setAddress('');
      setNotes('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackingResults(null);
    if (!trackQuery.trim()) {
      setTrackError('Please enter a booking reference (e.g., SAT-2026-8941) or registered phone number.');
      return;
    }

    setTrackingLoading(true);
    try {
      const bookings = await lookupBooking(trackQuery);
      setTrackingResults(bookings);
    } catch (err: any) {
      setTrackError(err.message || 'No booking records found for the given reference or phone.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Devotee Portal
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Online Pooja Booking & Sankalpam
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Register your family names, gotram, and birth stars for divine Agamic poojas. Each
            booking is assigned a unique reference ID and stored securely in our temple database.
          </p>

          {/* Tab Selector */}
          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'book'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Book New Pooja
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Check Booking Status
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'book' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-purple-50/70 p-6 sm:p-8 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-purple-950">
                  Devotee Pooja Registration Form
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  All fields marked with an asterisk (<span className="text-rose-500">*</span>) are
                  required for Sankalpam generation.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Instant e-Pass Issued</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="m-6 sm:m-8 mb-0 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              {/* Step 1: Devotee Primary Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-900" />
                  <span>1. Devotee Primary Particulars</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Devotee Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S. Ramanathan"
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone / Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98401 23456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramanathan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Pooja & Date Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-900" />
                  <span>2. Select Pooja & Preferred Schedule</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pooja Offering <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={poojaId}
                      onChange={(e) => setPoojaId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    >
                      {poojas.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={minDate}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Time Slot <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Pooja Details Card */}
                {selectedPooja && (
                  <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-purple-950 text-sm">
                        {selectedPooja.title}
                      </span>
                      <p className="text-slate-600 mt-0.5">{selectedPooja.description}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-purple-200 text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Dakshina
                      </span>
                      <span className="font-cinzel text-xl font-black text-amber-700">
                        ₹{selectedPooja.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Traditional Vedic Sankalpam (Optional) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-purple-900" />
                    <span>3. Traditional Sankalpam Details (Optional)</span>
                  </h3>
                  <span className="text-[11px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded font-medium">
                    Chanted during Pooja
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gotram / Rishi Lineage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kaundinya / Siva Gotram"
                      value={gotram}
                      onChange={(e) => setGotram(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nakshatra (Birth Star)
                    </label>
                    <select
                      value={nakshatra}
                      onChange={(e) => setNakshatra(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    >
                      <option value="">Select Nakshatra (Optional)</option>
                      {NAKSHATRAS.map((nak) => (
                        <option key={nak} value={nak}>
                          {nak}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rasi (Moon Sign)
                    </label>
                    <select
                      value={rasi}
                      onChange={(e) => setRasi(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    >
                      <option value="">Select Rasi (Optional)</option>
                      {RASIS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Family Members for Sankalpam (Names & relationship)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramanathan, Meenakshi (Wife), Arvind (Son)"
                      value={sankalpamNames}
                      onChange={(e) => setSankalpamNames(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Prasadam Delivery & Address */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-900" />
                  <span>4. Prasadam Collection Mode</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      prasadDelivery === 'temple'
                        ? 'border-purple-600 bg-purple-50/60'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="prasadDelivery"
                      checked={prasadDelivery === 'temple'}
                      onChange={() => setPrasadDelivery('temple')}
                      className="mt-1 text-purple-950 focus:ring-purple-950"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        In-Person at Temple Sanctum
                      </span>
                      <span className="text-xs text-slate-500">
                        Collect holy vibhuti, kumkum and prasadam package directly after pooja.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      prasadDelivery === 'postal'
                        ? 'border-purple-600 bg-purple-50/60'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="prasadDelivery"
                      checked={prasadDelivery === 'postal'}
                      onChange={() => setPrasadDelivery('postal')}
                      className="mt-1 text-purple-950 focus:ring-purple-950"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Speed Post / Courier Delivery
                      </span>
                      <span className="text-xs text-slate-500">
                        Blessed sacred prasadam package dispatched safely to your residence.
                      </span>
                    </div>
                  </label>
                </div>

                {prasadDelivery === 'postal' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complete Postal Address (with PIN code) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Door number, street name, area, city, pincode..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Prayers / Notes for the Priest
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Birthday prayer, wedding anniversary, health recovery..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 text-center sm:text-left">
                  By clicking Confirm, your booking is securely registered in Sri Amman Temple database.
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg shadow-purple-950/30 hover:from-purple-800 hover:to-indigo-800 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Booking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>
                        Confirm Booking (₹
                        {selectedPooja ? selectedPooja.price.toLocaleString('en-IN') : '101'})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Track Booking Tab */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
            <div className="max-w-2xl">
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-purple-950">
                Track Your Pooja Booking Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enter your unique Booking Reference Number (e.g., <code>SAT-2026-8941</code>) or the
                registered 10-digit mobile number to view confirmed details.
              </p>
            </div>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Booking Reference (e.g. SAT-2026-8941) or Mobile Phone..."
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-purple-950 text-white hover:bg-purple-900 transition-colors shadow flex items-center justify-center gap-2"
              >
                {trackingLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>Search Booking</span>
                  </>
                )}
              </button>
            </form>

            {trackError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{trackError}</span>
              </div>
            )}

            {trackingResults && trackingResults.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Found {trackingResults.length} Booking Record(s)
                </h3>
                <div className="space-y-4">
                  {trackingResults.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl border border-purple-100 bg-purple-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-950 text-base">
                            {b.bookingRef}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{b.poojaName}</p>
                        <p className="text-xs text-slate-500">
                          Devotee: {b.devoteeName} • Date: {b.date} ({b.timeSlot})
                        </p>
                      </div>

                      <button
                        onClick={() => setConfirmedBooking(b)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-purple-950 border border-purple-200 shadow-xs hover:bg-purple-50 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-600" />
                        <span>View & Print e-Pass</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Booking Pass Modal */}
      {confirmedBooking && (
        <BookingPassModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </div>
  );
};
