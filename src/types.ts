export interface TempleInfo {
  name: string;
  subTitle?: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  whatsapp: string;
  panorama360Url?: string;
  openingHours: {
    morning: string;
    evening: string;
  };
  history: string;
  traditions: string;
  trustDetails: {
    trustName: string;
    regNo: string;
    pan: string;
    taxExemption: string;
    bankName: string;
    accNo: string;
    ifsc: string;
  };
}

export interface PoojaTiming {
  id: string;
  name: string;
  time: string;
  description: string;
}

export interface Pooja {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  description: string;
  benefits: string;
  availableDays: string;
  isActive: boolean;
}

export interface Festival {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  badge: string;
  description: string;
  image: string;
  schedule: string[];
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  url: string;
  description?: string;
}

export interface Announcement {
  id: string;
  text: string;
  isImportant: boolean;
  date: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  devoteeName: string;
  phone: string;
  email: string;
  poojaId: string;
  poojaName: string;
  amount: number;
  date: string;
  timeSlot: string;
  gotram?: string;
  nakshatra?: string;
  rasi?: string;
  sankalpamNames?: string;
  prasadDelivery: 'temple' | 'postal';
  address?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface Donation {
  id: string;
  receiptNo: string;
  donorName: string;
  phone: string;
  email: string;
  category: string;
  amount: number;
  pan: string;
  address?: string;
  paymentMethod: string;
  paymentRef: string;
  status: 'verified' | 'pending';
  taxExempt: boolean;
  createdAt: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'responded';
  createdAt: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
  lastLogin?: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalDonationsAmount: number;
  verifiedDonationsCount: number;
  totalPoojas: number;
  upcomingFestivalsCount: number;
  recentBookings: Booking[];
  recentDonations: Donation[];
}
