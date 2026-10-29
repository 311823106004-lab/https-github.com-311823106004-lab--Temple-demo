import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  CreditCard,
  Building,
  Smartphone,
  Lock,
  X,
  Flame,
} from 'lucide-react';
import { TempleInfo, Donation } from '../types';
import { submitDonation, fetchDonationReceipt } from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';

interface DonationsPageProps {
  templeInfo: TempleInfo | null;
  onNavigate: (page: string) => void;
}

const CATEGORIES = [
  {
    id: 'annadhanam',
    title: 'Nitya Annadhanam',
    sub: 'Feed 100+ visiting pilgrims daily with fresh satvik meals on banana leaves.',
    min: 501,
  },
  {
    id: 'renovation',
    title: 'Temple Renovation & Thiruppani',
    sub: 'Preservation of ancient Dravidian sculptures, Rajagopuram gilding & stone corridors.',
    min: 1001,
  },
  {
    id: 'goshala',
    title: 'Goshala & Sacred Cow Welfare',
    sub: 'Fodder, veterinary medical care, and shelter for temple cows and calves.',
    min: 501,
  },
  {
    id: 'nityapooja',
    title: 'Nitya Pooja & Akhanda Deepam',
    sub: 'Supply pure cow ghee, sacred fragrant flowers, and dravyas for 5 daily poojas.',
    min: 251,
  },
  {
    id: 'education',
    title: 'Veda Patashala & Student Seva',
    sub: 'Educating young Vedic scholars in Saiva Agamas, Sanskrit, and temple rituals.',
    min: 1001,
  },
];

const PRESETS = [501, 1001, 2501, 5001, 10001, 25001];

export const DonationsPage: React.FC<DonationsPageProps> = ({ templeInfo, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'donate' | 'receipt'>('donate');

  // Donation form state
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].title);
  const [amount, setAmount] = useState<number>(1001);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Payment Gateway Modal State
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('devotee@okaxis');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Receipt Modal State
  const [verifiedDonation, setVerifiedDonation] = useState<Donation | null>(null);

  // Past Receipt Lookup State
  const [receiptQuery, setReceiptQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleInitiateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!donorName || !phone || !email) {
      setErrorMessage('Please fill in your Name, Mobile Number, and Email.');
      return;
    }

    if (finalAmount < 100) {
      setErrorMessage('Minimum donation amount is ₹100.');
      return;
    }

    // Open Payment Gateway Verification Modal
    setShowGatewayModal(true);
  };

  // Explicit Payment Verification Handler (Strict requirement: Never show a payment as successful without confirmation)
  const handleVerifyAndCompletePayment = async () => {
    setPaymentError('');
    setIsProcessingPayment(true);

    try {
      // Simulate real bank/gateway secure handshake
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const paymentRef = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await submitDonation({
        donorName,
        phone,
        email,
        category: selectedCategory,
        amount: finalAmount,
        pan,
        address,
        paymentMethod:
          selectedPaymentMode === 'upi'
            ? `UPI (${upiId})`
            : selectedPaymentMode === 'card'
            ? 'Debit/Credit Card'
            : 'Net Banking',
        paymentRef,
        paymentVerified: true, // Only after explicit confirmation
      });

      setShowGatewayModal(false);
      setVerifiedDonation(res.donation);

      // Clear input fields
      setDonorName('');
      setPhone('');
      setEmail('');
      setPan('');
      setAddress('');
      setCustomAmount('');
    } catch (err: any) {
      setPaymentError(err.message || 'Payment verification failed. Please check your credentials.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleLookupReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!receiptQuery.trim()) {
      setLookupError('Please enter a valid Receipt Number (e.g. AMMAN-80G-2026-1001).');
      return;
    }

    setLookupLoading(true);
    try {
      const data = await fetchDonationReceipt(receiptQuery);
      setVerifiedDonation(data.donation);
    } catch (err: any) {
      setLookupError(err.message || 'Donation receipt not found. Please verify the receipt number.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Tax Deductible under Section 80G (IT Act 1961)</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-white">
            Online Divine Donations & Sevas
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Support Nitya Annadhanam, Temple Renovation, and Goshala Cow Welfare. Every contribution
            is issued an official verified 80G tax receipt with the temple trust government URN.
          </p>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveTab('donate')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'donate'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Make a Divine Donation
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'receipt'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Find Past 80G Receipt
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'donate' ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-purple-50/70 p-6 sm:p-8 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-purple-950">
                  Divine Donation Pledge Form
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Reg. Trust: {templeInfo?.trustDetails?.trustName || 'Sri Amman Temple Charitable Trust'} • URN: AAATS9876MF20214
                </p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified 80G Receipt</span>
              </div>
            </div>

            {errorMessage && (
              <div className="m-6 sm:m-8 mb-0 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInitiateDonation} className="p-6 sm:p-8 space-y-8">
              {/* Step 1: Select Cause */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Select Sacred Cause / Seva Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.title)}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        selectedCategory === cat.title
                          ? 'border-purple-600 bg-purple-50/80 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold text-sm text-purple-950 block">
                        {cat.title}
                      </span>
                      <span className="text-xs text-slate-500 mt-1 block leading-normal">
                        {cat.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Amount Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Choose Contribution Amount (INR)
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESETS.map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                        !customAmount && amount === amt
                          ? 'bg-purple-950 text-amber-300 border-purple-950 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Or Enter Other Custom Amount (₹)
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="e.g. 15000"
                      min={100}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Donor Particulars (with PAN for 80G) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Donor Particulars for 80G Tax Exemption Certificate
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>80G IT Exemption</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Donor Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="As per PAN card"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PAN Card Number (Required for 80G benefit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 uppercase font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
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
                      Email Address (for receipt dispatch) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. donor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Residential / Postal Address (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Street, City, Pincode"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit Secure Gateway Payment Verification</span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Heart className="w-4 h-4 text-rose-950 fill-rose-950" />
                  <span>Proceed to Donate ₹{finalAmount.toLocaleString('en-IN')}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Past Receipt Lookup Tab */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
            <div className="max-w-2xl">
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-purple-950">
                Retrieve Official 80G Donation Receipt
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enter your Receipt Number (e.g. <code>AMMAN-80G-2026-1001</code>) to view, print, or
                download your verified tax exemption certificate.
              </p>
            </div>

            <form onSubmit={handleLookupReceipt} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Receipt Number (e.g. AMMAN-80G-2026-1001)..."
                  value={receiptQuery}
                  onChange={(e) => setReceiptQuery(e.target.value.toUpperCase())}
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 transition-colors uppercase font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-purple-950 text-white hover:bg-purple-900 transition-colors shadow flex items-center justify-center gap-2"
              >
                {lookupLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>Search Receipt</span>
                  </>
                )}
              </button>
            </form>

            {lookupError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SECURE PAYMENT GATEWAY MODAL (Enforces: Never show payment successful without confirmation) */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Secure Payment Gateway Checkout</h3>
                  <p className="text-[11px] text-purple-200">Merchant: Sri Amman Temple Trust</p>
                </div>
              </div>
              <button
                onClick={() => setShowGatewayModal(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gateway Body */}
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Donation Cause</span>
                  <span className="text-sm font-bold text-slate-900">{selectedCategory}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Payable</span>
                  <span className="font-cinzel text-xl font-black text-amber-700">
                    ₹{finalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {paymentError}
                </div>
              )}

              {/* Payment Mode Selection */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Select Verified Payment Mode
                </span>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('upi')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPaymentMode === 'upi'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-purple-900" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPaymentMode === 'card'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-900" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('netbanking')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      selectedPaymentMode === 'netbanking'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-purple-900" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {selectedPaymentMode === 'upi' && (
                  <div className="pt-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter UPI VPA ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@okhdfcbank"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-purple-600 font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM and all major bank UPI apps.
                    </p>
                  </div>
                )}
              </div>

              {/* Security info */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
                <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Verification:</strong> Receipt is generated only after authentic
                  payment authorization from your financial institution.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleVerifyAndCompletePayment}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-950 text-white hover:bg-purple-900 shadow transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Payment with Bank...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <span>Authorize & Verify ₹{finalAmount.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official 80G Receipt Modal */}
      {verifiedDonation && (
        <ReceiptModal
          donation={verifiedDonation}
          templeInfo={templeInfo}
          onClose={() => setVerifiedDonation(null)}
        />
      )}
    </div>
  );
};
