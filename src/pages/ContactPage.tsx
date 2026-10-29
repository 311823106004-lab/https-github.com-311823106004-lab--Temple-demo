import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { TempleInfo } from '../types';
import { submitContact } from '../services/api';

interface ContactPageProps {
  templeInfo: TempleInfo | null;
}

export const ContactPage: React.FC<ContactPageProps> = ({ templeInfo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !message) {
      setErrorMessage('Please fill in your Name, Email, and Message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact({
        name,
        email,
        phone,
        subject: subject || 'General Devotee Enquiry',
        message,
      });

      setSuccessMessage(res.message);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappNumber = templeInfo?.whatsapp || '+919840123456';
  const cleanWhatsAppNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    'Namaskaram, I am contacting Sri Amman Temple office regarding darshan / pooja enquiry.'
  )}`;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Temple Sanctum
          </span>
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Contact & Location Details
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Reach the Sri Amman Temple administrative office for darshan queries, special muhurtham
            bookings, or send a quick WhatsApp message to our priest coordinators.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards, WhatsApp, and Timings */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick WhatsApp Action Card */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-6 rounded-3xl shadow-lg border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-400/40">
                  <MessageSquare className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Instant WhatsApp Enquiry</h3>
                  <p className="text-xs text-emerald-200">Temple Office Desk • Immediate Response</p>
                </div>
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Connect directly with the temple administrative coordinator for quick queries regarding
                today's special darshan, crowds, or prasadam courier tracking.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-slate-950" />
                <span>Chat on WhatsApp ({templeInfo?.whatsapp || '+91 98401 23456'})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Address & Phone Details */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-purple-950 border-b border-slate-100 pb-3">
                Sanctum Office Address
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Location</span>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {templeInfo?.location ||
                        'No. 48, Sannadhi Street, Mylapore, Chennai, Tamil Nadu 600004, India'}
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Landmark: Opposite Mylapore Tank / Near Luz Corner
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-purple-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Phone Numbers</span>
                    <a
                      href={`tel:${templeInfo?.phone || '+914424987654'}`}
                      className="text-purple-950 font-bold hover:underline block"
                    >
                      {templeInfo?.phone || '+91 44 2498 7654 / +91 98401 23456'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Official Email</span>
                    <a
                      href={`mailto:${templeInfo?.email || 'darshan@sriamman.org'}`}
                      className="text-purple-950 font-bold hover:underline block"
                    >
                      {templeInfo?.email || 'darshan@sriamman.org'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-purple-900 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Daily Darshan Hours</span>
                    <p className="text-slate-900 text-xs">
                      Morning: {templeInfo?.openingHours?.morning || '05:30 AM – 12:30 PM'}
                    </p>
                    <p className="text-slate-900 text-xs">
                      Evening: {templeInfo?.openingHours?.evening || '04:30 PM – 09:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps & Enquiry Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Map Visualizer */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-purple-900" />
                  <span className="text-xs font-bold text-slate-800">
                    Temple Location Map (Mylapore Sanctum)
                  </span>
                </div>
                <a
                  href="https://maps.google.com/?q=Mylapore+Chennai+Tamil+Nadu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-900 hover:text-purple-700"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Styled Interactive Map Embed */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
                <iframe
                  title="Temple Google Map"
                  src="https://maps.google.com/maps?q=Mylapore%20Temple%20Chennai&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Devotee Enquiry Form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="font-cinzel text-xl font-bold text-purple-950">
                  Send an Enquiry to Temple Office
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Have a specific question regarding poojas, special darshan for seniors, or trust
                  matters? Write to us and our staff will respond promptly.
                </p>
              </div>

              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Krishnan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      placeholder="e.g. ananya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 99620 44332"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Citizen Wheelchair Assistance"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Message / Question <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your enquiry in detail here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-purple-950 text-white hover:bg-purple-900 shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-300" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
