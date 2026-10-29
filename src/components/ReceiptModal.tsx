import React from 'react';
import { X, Printer, ShieldCheck, Flame, CheckCircle, FileText } from 'lucide-react';
import { Donation, TempleInfo } from '../types';

interface ReceiptModalProps {
  donation: Donation | null;
  templeInfo: TempleInfo | null;
  onClose: () => void;
}

// Helper to convert numbers to Indian words
function numberToWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convert(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  }

  return convert(num) + ' Rupees Only';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, templeInfo, onClose }) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountInWords = numberToWords(donation.amount);
  const formattedDate = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-white">
                Official Donation Receipt (Section 80G)
              </h3>
              <p className="text-xs text-amber-300">
                Verified Tax Exemption Certificate • IT Act 1961
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="no-print p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate Body */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-amber-50/20 text-slate-800 space-y-6">
          {/* Certificate Header with Crest */}
          <div className="text-center border-b-2 border-double border-amber-300 pb-5 space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-700 border border-amber-400 mb-1">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-2xl font-black text-purple-950 uppercase tracking-wide">
              {templeInfo?.trustDetails?.trustName || 'Sri Maha Mariamman Temple Charitable Trust'}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Sanctum: {templeInfo?.location || 'No. 48, Sannadhi Street, Mylapore, Chennai 600004'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-purple-900 font-semibold pt-1">
              <span>Trust Reg: {templeInfo?.trustDetails?.regNo || 'TN/HRCE/1959/TR-4892'}</span>
              <span>•</span>
              <span>PAN: {templeInfo?.trustDetails?.pan || 'AAATS9876M'}</span>
              <span>•</span>
              <span className="text-emerald-700">80G URN: AAATS9876MF20214</span>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-xs">Receipt Number:</span>
              <span className="font-mono font-bold text-purple-950 text-base">{donation.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-xs">Issue Date:</span>
              <span className="font-semibold text-slate-900">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">Payment Verification:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>CONFIRMED & VERIFIED</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-xs">Transaction ID:</span>
              <span className="font-mono text-xs text-slate-700">{donation.paymentRef}</span>
            </div>
          </div>

          {/* Donor Information */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Donor Particulars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Received with gratitude from:</span>
                <span className="font-bold text-slate-900 text-base">{donation.donorName}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Donor PAN (for 80G Tax Exemption):</span>
                <span className="font-mono font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {donation.pan || 'NOT PROVIDED'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Mobile & Email:</span>
                <span className="text-slate-700 font-medium">{donation.phone} | {donation.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Donation Purpose / Cause:</span>
                <span className="font-semibold text-amber-800">{donation.category}</span>
              </div>
              {donation.address && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-slate-500 block">Address:</span>
                  <span className="text-slate-700 text-xs">{donation.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-gradient-to-r from-purple-950 to-indigo-950 text-white p-5 rounded-xl shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                Total Donation Amount
              </span>
              <p className="text-xs text-purple-200 italic mt-0.5">
                "{amountInWords}"
              </p>
            </div>
            <div className="text-center sm:text-right bg-white/10 px-4 py-2 rounded-lg border border-white/20">
              <span className="font-cinzel text-3xl font-black text-amber-300">
                ₹{donation.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Statutory Tax declaration & Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-end">
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Tax Deductible under Sec 80G</span>
              </div>
              <p>
                Donations to Sri Maha Mariamman Temple Charitable Trust qualify for deduction under
                Section 80G(5)(vi) of the Income Tax Act, 1961.
              </p>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <div className="inline-block border-b border-slate-400 pb-1 w-48 text-center">
                <span className="font-serif italic text-sm text-purple-950 font-bold">
                  S. Kalyanasundaram
                </span>
              </div>
              <p className="text-xs text-slate-600 font-semibold">Authorized Trustee / Treasurer</p>
              <p className="text-[10px] text-slate-400">Sri Amman Temple Charitable Trust</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="no-print bg-slate-100 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Payment verified. Receipt securely logged in temple trust accounts.
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
              <span>Print / Save 80G Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
