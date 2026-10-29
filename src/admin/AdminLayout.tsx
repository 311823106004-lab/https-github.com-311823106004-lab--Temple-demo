import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Flame,
  Clock,
  Sparkles,
  Heart,
  Image,
  Bell,
  Settings,
  Shield,
  BookOpen,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Search,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Filter,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import {
  AdminUser,
  Booking,
  Pooja,
  PoojaTiming,
  Festival,
  GalleryImage,
  Announcement,
  Donation,
  TempleInfo,
  DashboardStats,
} from '../types';
import {
  logoutAdmin,
  fetchDashboardStats,
  fetchAllBookings,
  updateBookingStatus,
  deleteBooking,
  fetchPoojas,
  createPooja,
  updatePooja,
  deletePooja,
  fetchPoojaTimings,
  updatePoojaTimings,
  fetchFestivals,
  createFestival,
  updateFestival,
  deleteFestival,
  fetchGallery,
  addGalleryImage,
  deleteGalleryImage,
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  fetchAllDonations,
  fetchTempleInfo,
  updateTempleInfo,
  changePassword,
} from '../services/api';
import { ReceiptModal } from '../components/ReceiptModal';
import { BookingPassModal } from '../components/BookingPassModal';

interface AdminLayoutProps {
  admin: AdminUser;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  admin,
  onLogout,
  onViewPublicSite,
}) => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [poojas, setPoojas] = useState<Pooja[]>([]);
  const [timings, setTimings] = useState<PoojaTiming[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [templeInfo, setTempleInfo] = useState<TempleInfo | null>(null);

  // UI / Modal States
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | null>(null);
  const [bannerAlert, setBannerAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [donationSearch, setDonationSearch] = useState('');

  // Modals
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [editingPooja, setEditingPooja] = useState<Pooja | null>(null);
  const [poojaForm, setPoojaForm] = useState<Partial<Pooja>>({
    title: '',
    category: 'Daily Archana',
    price: 101,
    duration: '20 mins',
    description: '',
    benefits: '',
    availableDays: 'All Days',
    isActive: true,
  });

  const [festivalModalOpen, setFestivalModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);
  const [festivalForm, setFestivalForm] = useState<Partial<Festival>>({
    title: '',
    startDate: '',
    endDate: '',
    badge: 'Grand Utsavam',
    description: '',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    schedule: ['Day 1: Special Alankaram', 'Day 2: Praharam Procession'],
  });

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Sanctum & Rituals',
    url: '',
    description: '',
  });

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementImportant, setAnnouncementImportant] = useState(false);

  // Security Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Temple Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<TempleInfo>>({});

  const reloadData = async () => {
    try {
      const [sData, bData, pData, tData, fData, gData, aData, dData, iData] = await Promise.all([
        fetchDashboardStats(),
        fetchAllBookings(),
        fetchPoojas(),
        fetchPoojaTimings(),
        fetchFestivals(),
        fetchGallery(),
        fetchAnnouncements(),
        fetchAllDonations(),
        fetchTempleInfo(),
      ]);
      setStats(sData);
      setBookings(bData);
      setPoojas(pData);
      setTimings(tData);
      setFestivals(fData);
      setGallery(gData);
      setAnnouncements(aData);
      setDonations(dData);
      setTempleInfo(iData);
      setSettingsForm(iData);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setBannerAlert({ type, message });
    setTimeout(() => setBannerAlert(null), 4000);
  };

  // ----------------------------------------------------
  // BOOKINGS HANDLERS
  // ----------------------------------------------------
  const handleUpdateBookingStatus = async (id: string, status: 'Confirmed' | 'Completed' | 'Cancelled', reason?: string) => {
    try {
      await updateBookingStatus(id, { status, rejectionReason: reason });
      showAlert('success', `Booking marked as ${status}.`);
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to update booking status.');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking record?')) return;
    try {
      await deleteBooking(id);
      showAlert('success', 'Booking record deleted.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete booking.');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/bookings/export-csv', '_blank');
  };

  // ----------------------------------------------------
  // POOJA CRUD
  // ----------------------------------------------------
  const handleSavePooja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPooja) {
        await updatePooja(editingPooja.id, poojaForm);
        showAlert('success', 'Pooja updated successfully.');
      } else {
        await createPooja(poojaForm as any);
        showAlert('success', 'New pooja service created.');
      }
      setPoojaModalOpen(false);
      setEditingPooja(null);
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to save pooja.');
    }
  };

  const handleDeletePooja = async (id: string) => {
    if (!window.confirm('Delete this pooja service permanently?')) return;
    try {
      await deletePooja(id);
      showAlert('success', 'Pooja deleted successfully.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete pooja.');
    }
  };

  // ----------------------------------------------------
  // FESTIVALS CRUD
  // ----------------------------------------------------
  const handleSaveFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFestival) {
        await updateFestival(editingFestival.id, festivalForm);
        showAlert('success', 'Festival updated successfully.');
      } else {
        await createFestival(festivalForm as any);
        showAlert('success', 'New festival created.');
      }
      setFestivalModalOpen(false);
      setEditingFestival(null);
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to save festival.');
    }
  };

  const handleDeleteFestival = async (id: string) => {
    if (!window.confirm('Delete this festival record?')) return;
    try {
      await deleteFestival(id);
      showAlert('success', 'Festival deleted.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete festival.');
    }
  };

  // ----------------------------------------------------
  // GALLERY CRUD
  // ----------------------------------------------------
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.url || !galleryForm.title) {
      showAlert('error', 'Please provide image title and URL.');
      return;
    }
    try {
      await addGalleryImage(galleryForm);
      showAlert('success', 'Gallery photo added.');
      setGalleryModalOpen(false);
      setGalleryForm({ title: '', category: 'Sanctum & Rituals', url: '', description: '' });
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to add image.');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this image from gallery?')) return;
    try {
      await deleteGalleryImage(id);
      showAlert('success', 'Image removed.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete image.');
    }
  };

  // ----------------------------------------------------
  // ANNOUNCEMENTS
  // ----------------------------------------------------
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText) return;
    try {
      await createAnnouncement({ text: announcementText, isImportant: announcementImportant });
      showAlert('success', 'Announcement published.');
      setAnnouncementModalOpen(false);
      setAnnouncementText('');
      setAnnouncementImportant(false);
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to add announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      showAlert('success', 'Announcement deleted.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to delete announcement.');
    }
  };

  // ----------------------------------------------------
  // TIMINGS SAVE
  // ----------------------------------------------------
  const handleSaveTimings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePoojaTimings(timings);
      showAlert('success', 'Daily pooja timings updated successfully.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to update timings.');
    }
  };

  // ----------------------------------------------------
  // SETTINGS SAVE
  // ----------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTempleInfo(settingsForm);
      showAlert('success', 'Temple information & Trust details updated.');
      reloadData();
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to update settings.');
    }
  };

  // ----------------------------------------------------
  // SECURITY (PASSWORD CHANGE)
  // ----------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert('error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('error', 'Password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      showAlert('success', 'Admin password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showAlert('error', err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Pooja Bookings', icon: CalendarCheck, badge: stats?.pendingBookings },
    { id: 'poojas', label: 'Pooja Services', icon: Flame },
    { id: 'timings', label: 'Daily Timings', icon: Clock },
    { id: 'festivals', label: 'Festivals & Events', icon: Sparkles },
    { id: 'donations', label: '80G Donations', icon: Heart },
    { id: 'gallery', label: 'Photo Gallery', icon: Image },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'settings', label: 'Temple Settings', icon: Settings },
    { id: 'security', label: 'Admin Security', icon: Shield },
    { id: 'guide', label: 'System Integration', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 border-b border-purple-900/40 p-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="font-cinzel text-base font-bold text-white block">
              Temple Admin
            </span>
            <span className="text-[10px] text-amber-400">Sri Amman Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 border-r border-purple-900/30 flex flex-col justify-between z-40 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-800 to-amber-600 border border-amber-400 flex items-center justify-center text-amber-200 shadow-md">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold text-white tracking-wide leading-tight">
                Sri Amman Temple
              </h2>
              <span className="text-[11px] text-amber-400 font-medium">Administration Suite</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-900/80 text-amber-300 font-bold border border-purple-700/60 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar User Info & Logout */}
        <div className="p-4 border-t border-slate-900 bg-black/30 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-950 border border-purple-700 flex items-center justify-center text-amber-300 font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{admin.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onViewPublicSite}
              className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              title="Open Public Temple Website"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>Public Site</span>
            </button>
            <button
              onClick={onLogout}
              className="py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-[11px] font-semibold text-rose-300 hover:text-rose-100 border border-rose-900/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top bar on desktop */}
        <div className="hidden md:flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white capitalize flex items-center gap-2">
              <span>{activeView.replace('_', ' ')}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sri Amman Temple Management Console • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reloadData}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onViewPublicSite}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Public Website</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {bannerAlert && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              bannerAlert.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-600 text-rose-200'
            }`}
          >
            {bannerAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{bannerAlert.message}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-purple-900/40 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Total Bookings
                  </span>
                  <div className="p-2 rounded-lg bg-purple-950 text-purple-300">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{stats?.totalBookings || 0}</span>
                  <span className="text-xs text-slate-400">devotees</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-amber-900/40 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    Pending Confirmation
                  </span>
                  <div className="p-2 rounded-lg bg-amber-950 text-amber-300">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-300">
                    {stats?.pendingBookings || 0}
                  </span>
                  <span className="text-xs text-amber-400/80">awaiting approval</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-emerald-900/40 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    Verified Donations
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-950 text-emerald-300">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-300">
                    ₹{(stats?.totalDonationsAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-indigo-900/40 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                    Upcoming Festivals
                  </span>
                  <div className="p-2 rounded-lg bg-indigo-950 text-indigo-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {stats?.upcomingFestivalsCount || festivals.length}
                  </span>
                  <span className="text-xs text-slate-400">utsavams</span>
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  setEditingPooja(null);
                  setPoojaForm({
                    title: '',
                    category: 'Daily Archana',
                    price: 101,
                    duration: '20 mins',
                    description: '',
                    benefits: '',
                    availableDays: 'All Days',
                    isActive: true,
                  });
                  setPoojaModalOpen(true);
                }}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-purple-600 transition-colors group"
              >
                <Plus className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Add Pooja Service</span>
                <span className="text-[11px] text-slate-400">Configure dakshina & duration</span>
              </button>

              <button
                onClick={() => {
                  setEditingFestival(null);
                  setFestivalForm({
                    title: '',
                    startDate: '',
                    endDate: '',
                    badge: 'Grand Utsavam',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
                    schedule: ['Day 1: Flag Hoisting', 'Day 2: Praharam Procession'],
                  });
                  setFestivalModalOpen(true);
                }}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-purple-600 transition-colors group"
              >
                <Plus className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Add New Festival</span>
                <span className="text-[11px] text-slate-400">Publish dates & ceremonies</span>
              </button>

              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-purple-600 transition-colors group"
              >
                <Bell className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Post Notice Banner</span>
                <span className="text-[11px] text-slate-400">Update top website marquee</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left hover:border-purple-600 transition-colors group"
              >
                <Download className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-white block">Export Bookings CSV</span>
                <span className="text-[11px] text-slate-400">Download report for priests</span>
              </button>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Recent Devotee Pooja Registrations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest submissions stored in persistent database
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('bookings')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>View All Bookings</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Devotee Name</th>
                      <th className="py-3 px-4">Pooja Service</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Prasad</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                          {b.bookingRef}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div>{b.devoteeName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{b.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          {b.poojaName}
                          <div className="text-[10px] text-amber-400">₹{b.amount}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div>{b.date}</div>
                          <div className="text-[10px] text-slate-500">{b.timeSlot}</div>
                        </td>
                        <td className="py-3.5 px-4 capitalize">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${b.prasadDelivery === 'postal' ? 'bg-indigo-950 text-indigo-300' : 'bg-slate-800 text-slate-300'}`}>
                            {b.prasadDelivery}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Confirmed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : b.status === 'Pending'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedBookingForDetails(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="View Sankalpam Particulars"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                              className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700"
                              title="Confirm Booking"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: POOJA BOOKINGS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeView === 'bookings' && (
          <div className="space-y-6">
            {/* Header with Search and Export */}
            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Bookings to CSV</span>
              </button>
            </div>

            {/* Bookings Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Devotee Name</th>
                      <th className="py-3 px-4">Pooja Service</th>
                      <th className="py-3 px-4">Date & Slot</th>
                      <th className="py-3 px-4">Gotram / Star</th>
                      <th className="py-3 px-4">Prasad</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bookings
                      .filter((b) => {
                        const matchStatus =
                          bookingStatusFilter === 'All' || b.status === bookingStatusFilter;
                        const matchSearch =
                          b.devoteeName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.bookingRef.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                          b.phone.includes(bookingSearch);
                        return matchStatus && matchSearch;
                      })
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                            {b.bookingRef}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-white">
                            <div>{b.devoteeName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{b.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold">{b.poojaName}</div>
                            <div className="text-amber-400 text-[10px]">₹{b.amount}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{b.date}</div>
                            <div className="text-[10px] text-slate-500">{b.timeSlot}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>{b.gotram || 'Siva Gotram'}</div>
                            <div className="text-[10px] text-purple-300 font-medium">
                              {b.nakshatra || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 capitalize">
                            <span className="text-[11px] text-slate-400">{b.prasadDelivery}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedBookingForDetails(b)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                              title="View Full Sankalpam"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {b.status !== 'Confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')}
                                className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800"
                                title="Approve / Confirm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection / cancellation reason:');
                                  if (reason) handleUpdateBookingStatus(b.id, 'Cancelled', reason);
                                }}
                                className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800"
                                title="Reject / Cancel"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteBooking(b.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: POOJA SERVICES MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeView === 'poojas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Manage Pooja Offerings & Prices
                </h2>
                <p className="text-xs text-slate-400">
                  Update dakshina amount, duration, descriptions and availability.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPooja(null);
                  setPoojaForm({
                    title: '',
                    category: 'Daily Archana',
                    price: 101,
                    duration: '20 mins',
                    description: '',
                    benefits: '',
                    availableDays: 'All Days',
                    isActive: true,
                  });
                  setPoojaModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Pooja</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {poojas.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                        {p.category}
                      </span>
                      <span className="text-xs text-slate-400">{p.duration}</span>
                    </div>

                    <h3 className="font-cinzel text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                    <div className="text-[11px] text-amber-300">
                      Days: {p.availableDays}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-cinzel text-xl font-bold text-amber-400">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPooja(p);
                          setPoojaForm(p);
                          setPoojaModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title="Edit Pooja"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePooja(p.id)}
                        className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                        title="Delete Pooja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: DAILY POOJA TIMINGS */}
        {/* ---------------------------------------------------- */}
        {activeView === 'timings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Update Daily Pooja Timings & Hours
                </h2>
                <p className="text-xs text-slate-400">
                  Reflects instantly on the public website and Today's Timings card.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveTimings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timings.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...timings];
                          updated[idx].name = e.target.value;
                          setTimings(updated);
                        }}
                        className="font-bold text-sm text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 flex-1 focus:border-amber-400"
                      />
                      <input
                        type="text"
                        value={t.time}
                        onChange={(e) => {
                          const updated = [...timings];
                          updated[idx].time = e.target.value;
                          setTimings(updated);
                        }}
                        className="font-mono text-xs text-amber-300 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 w-28 text-center focus:border-amber-400"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={t.description}
                      onChange={(e) => {
                        const updated = [...timings];
                        updated[idx].description = e.target.value;
                        setTimings(updated);
                      }}
                      className="w-full text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-700 focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
                >
                  Save Daily Pooja Timings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 5: FESTIVALS & EVENTS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeView === 'festivals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Manage Festivals & Sacred Calendar
                </h2>
                <p className="text-xs text-slate-400">
                  Add annual utsavams, milk pot processions, and special schedules.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingFestival(null);
                  setFestivalForm({
                    title: '',
                    startDate: '',
                    endDate: '',
                    badge: 'Grand Utsavam',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
                    schedule: ['Day 1: Flag Hoisting', 'Day 2: Praharam Procession'],
                  });
                  setFestivalModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Festival</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {festivals.map((fest) => (
                <div
                  key={fest.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-44">
                    <img src={fest.image} alt={fest.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 bg-slate-950/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-400/40">
                      {fest.badge}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-300">
                        {fest.startDate} to {fest.endDate}
                      </span>
                      <h3 className="font-cinzel text-lg font-bold text-white mt-1">
                        {fest.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                        {fest.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {fest.schedule?.length || 0} scheduled ceremony days
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingFestival(fest);
                            setFestivalForm(fest);
                            setFestivalModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFestival(fest.id)}
                          className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 6: 80G DONATIONS & RECEIPTS */}
        {/* ---------------------------------------------------- */}
        {activeView === 'donations' && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Verified 80G Donations Records
                </h2>
                <p className="text-xs text-slate-400">
                  Official certificates issued only upon authenticated payment gateway verification.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search donor, receipt, PAN..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Donor Name & Contact</th>
                      <th className="py-3 px-4">PAN (80G)</th>
                      <th className="py-3 px-4">Cause</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {donations
                      .filter(
                        (d) =>
                          d.donorName.toLowerCase().includes(donationSearch.toLowerCase()) ||
                          d.receiptNo.toLowerCase().includes(donationSearch.toLowerCase()) ||
                          (d.pan && d.pan.toLowerCase().includes(donationSearch.toLowerCase()))
                      )
                      .map((d) => (
                        <tr key={d.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                            {d.receiptNo}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{d.donorName}</div>
                            <div className="text-[11px] text-slate-500">{d.phone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                            {d.pan || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-300">{d.category}</td>
                          <td className="py-3.5 px-4 font-cinzel text-sm font-bold text-emerald-400">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                            {d.paymentRef}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-800 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>VERIFIED</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedDonationForReceipt(d)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>View 80G Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 7: PHOTO GALLERY MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeView === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Manage Temple Photo Gallery
                </h2>
                <p className="text-xs text-slate-400">
                  Upload images of sanctum, gopuram, festivals and prasad distribution.
                </p>
              </div>
              <button
                onClick={() => setGalleryModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img) => (
                <div
                  key={img.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-slate-900">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 left-2.5 bg-black/70 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {img.category}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">
                      {img.title}
                    </span>
                    <button
                      onClick={() => handleDeleteGallery(img.id)}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 8: ANNOUNCEMENTS MANAGEMENT */}
        {/* ---------------------------------------------------- */}
        {activeView === 'announcements' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Manage Website Announcements & Notices
                </h2>
                <p className="text-xs text-slate-400">
                  Displayed on the top marquee notice bar on all public pages.
                </p>
              </div>
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Notice</span>
              </button>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {ann.isImportant && (
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-400/40">
                          Important Notice
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">{ann.date}</span>
                    </div>
                    <p className="text-sm text-slate-200">{ann.text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-2 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 9: TEMPLE SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeView === 'settings' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Temple Identity & Trust Configuration
              </h2>
              <p className="text-xs text-slate-400">
                Update temple contact details, location, and statutory 80G trust parameters.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Temple Official Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sub-title / Devasthanam Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.subTitle || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, subTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tagline / Motto
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sanctum Postal Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.location || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Office Phone Numbers
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Enquiry Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Trust Registration Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.trustDetails?.regNo || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        trustDetails: {
                          ...(settingsForm.trustDetails as any),
                          regNo: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom 360° Hero Panorama Equirectangular Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/... or leave blank for multi-viewpoint Agamic panorama"
                    value={settingsForm.panorama360Url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, panorama360Url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leave blank to use the built-in 360° viewpoints (Rajagopuram, Praharam Mandapam, and Sacred Teertham).
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 shadow"
                >
                  Save Temple Info
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 10: ADMIN SECURITY (PASSWORD) */}
        {/* ---------------------------------------------------- */}
        {activeView === 'security' && (
          <div className="max-w-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Change Admin Password
              </h2>
              <p className="text-xs text-slate-400">
                Update your administrative login credentials securely.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 11: SYSTEM INTEGRATION & SETUP GUIDE */}
        {/* ---------------------------------------------------- */}
        {activeView === 'guide' && (
          <div className="space-y-6 max-w-4xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Backend Configuration & Deployment Guide
              </h2>
              <p className="text-xs text-slate-400">
                Setup instructions for persistent databases, payment gateways, and cloud deployment.
              </p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              {/* Database Guide */}
              <div className="bg-slate-950 border border-purple-900/40 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <span>1. Database Architecture & Storage</span>
                </h3>
                <p>
                  The application currently persists all temple bookings, donations, pooja services,
                  and settings in <code>/data/temple_data.json</code> with atomic file operations on
                  the server.
                </p>
                <p className="text-slate-400">
                  <strong>To connect Supabase or PostgreSQL:</strong> Define <code>DATABASE_URL</code> in your environment variables, run Drizzle or Prisma migrations against the schema, and point your API endpoints to the database client.
                </p>
              </div>

              {/* Payment Gateway Guide */}
              <div className="bg-slate-950 border border-emerald-900/40 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <span>2. Payment Gateway Integration (Razorpay / Stripe)</span>
                </h3>
                <p>
                  The donation portal implements strict payment verification: receipts and 80G tax
                  exemption certificates are generated <em>only after verified authorization</em>.
                </p>
                <p className="text-slate-400">
                  <strong>To enable live Razorpay:</strong> Add <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> to <code>.env</code> on the server. Inject <code>https://checkout.razorpay.com/v1/checkout.js</code> and verify the cryptographic signature in <code>/api/donations</code> before issuing receipt numbers.
                </p>
              </div>

              {/* Deployment Guide */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <span>3. Production Deployment (Cloud Run / Vercel / Node VPS)</span>
                </h3>
                <p>
                  Run <code>npm run build</code> to produce production static assets in <code>dist/</code>.
                  The full-stack application launches via <code>npm start</code> (running <code>server.ts</code> on port 3000), serving both API endpoints and pre-compiled client assets.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL: VIEW SANKALPAM / DEVOTEE DETAILS */}
      {/* ---------------------------------------------------- */}
      {selectedBookingForDetails && (
        <BookingPassModal
          booking={selectedBookingForDetails}
          onClose={() => setSelectedBookingForDetails(null)}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: 80G RECEIPT */}
      {/* ---------------------------------------------------- */}
      {selectedDonationForReceipt && (
        <ReceiptModal
          donation={selectedDonationForReceipt}
          templeInfo={templeInfo}
          onClose={() => setSelectedDonationForReceipt(null)}
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT POOJA */}
      {/* ---------------------------------------------------- */}
      {poojaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">
                {editingPooja ? 'Edit Pooja Offering' : 'Add New Pooja Offering'}
              </h3>
              <button onClick={() => setPoojaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePooja} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Pooja Title</label>
                <input
                  type="text"
                  required
                  value={poojaForm.title || ''}
                  onChange={(e) => setPoojaForm({ ...poojaForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g. Thirumanjana Abhishekam"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={poojaForm.category || 'Daily Archana'}
                    onChange={(e) => setPoojaForm({ ...poojaForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Daily Archana">Daily Archana</option>
                    <option value="Abhishekam">Abhishekam</option>
                    <option value="Special Pooja">Special Pooja</option>
                    <option value="Homam & Yagna">Homam & Yagna</option>
                    <option value="Astrological Pooja">Astrological Pooja</option>
                    <option value="Grand Utsavam">Grand Utsavam</option>
                    <option value="Seva">Seva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Price / Dakshina (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={poojaForm.price || 0}
                    onChange={(e) => setPoojaForm({ ...poojaForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Duration</label>
                  <input
                    type="text"
                    value={poojaForm.duration || ''}
                    onChange={(e) => setPoojaForm({ ...poojaForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g. 45 mins"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Available Days</label>
                  <input
                    type="text"
                    value={poojaForm.availableDays || ''}
                    onChange={(e) => setPoojaForm({ ...poojaForm, availableDays: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="e.g. All Days / Fridays"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={poojaForm.description || ''}
                  onChange={(e) => setPoojaForm({ ...poojaForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Benefits & Significance</label>
                <textarea
                  rows={2}
                  value={poojaForm.benefits || ''}
                  onChange={(e) => setPoojaForm({ ...poojaForm, benefits: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPoojaModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Pooja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD / EDIT FESTIVAL */}
      {/* ---------------------------------------------------- */}
      {festivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">
                {editingFestival ? 'Edit Festival' : 'Add New Festival'}
              </h3>
              <button onClick={() => setFestivalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFestival} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Festival Name</label>
                <input
                  type="text"
                  required
                  value={festivalForm.title || ''}
                  onChange={(e) => setFestivalForm({ ...festivalForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g. Aadi Thiruvizha"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.startDate || ''}
                    onChange={(e) => setFestivalForm({ ...festivalForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.endDate || ''}
                    onChange={(e) => setFestivalForm({ ...festivalForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Badge Label</label>
                <input
                  type="text"
                  value={festivalForm.badge || ''}
                  onChange={(e) => setFestivalForm({ ...festivalForm, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g. 10-Day Grand Utsavam"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Image URL</label>
                <input
                  type="url"
                  value={festivalForm.image || ''}
                  onChange={(e) => setFestivalForm({ ...festivalForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={festivalForm.description || ''}
                  onChange={(e) => setFestivalForm({ ...festivalForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFestivalModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: ADD GALLERY IMAGE */}
      {/* ---------------------------------------------------- */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Add Photo to Temple Gallery</h3>
              <button onClick={() => setGalleryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Photo Title</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g. Illuminated Rajagopuram at Twilight"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Sanctum & Rituals">Sanctum & Rituals</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Festivals">Festivals</option>
                  <option value="Annadhanam">Annadhanam</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Image URL (Unsplash or direct image)</label>
                <input
                  type="url"
                  required
                  value={galleryForm.url}
                  onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Caption / Description</label>
                <textarea
                  rows={2}
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: POST ANNOUNCEMENT */}
      {/* ---------------------------------------------------- */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Publish Top Marquee Announcement</h3>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Notice Text</label>
                <textarea
                  rows={3}
                  required
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g. Chitra Pournami: Special 108 Milk Pot Abhishekam bookings are now open."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={announcementImportant}
                  onChange={(e) => setAnnouncementImportant(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Highlight as Important Urgent Alert</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
