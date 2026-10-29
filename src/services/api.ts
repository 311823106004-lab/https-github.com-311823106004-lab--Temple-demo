import {
  TempleInfo,
  PoojaTiming,
  Pooja,
  Festival,
  GalleryImage,
  Announcement,
  Booking,
  Donation,
  ContactEnquiry,
  DashboardStats,
  AdminUser,
} from '../types';

const TOKEN_KEY = 'sat_admin_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ----------------------------------------------------------------------
// AUTH API
// ----------------------------------------------------------------------
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; token: string; admin: AdminUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authenticate');
  }
  setAuthToken(data.token);
  return data;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders(),
    });
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    clearAuthToken();
  }
}

export async function checkAuth(): Promise<{ authenticated: boolean; admin?: AdminUser }> {
  const token = getAuthToken();
  if (!token) return { authenticated: false };
  try {
    const res = await fetch('/api/auth/me', {
      headers: authHeaders(),
    });
    if (!res.ok) {
      clearAuthToken();
      return { authenticated: false };
    }
    return await res.json();
  } catch {
    return { authenticated: false };
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update password');
  return data;
}

// ----------------------------------------------------------------------
// TEMPLE INFO
// ----------------------------------------------------------------------
export async function fetchTempleInfo(): Promise<TempleInfo> {
  const res = await fetch('/api/temple-info');
  if (!res.ok) throw new Error('Failed to fetch temple details');
  return res.json();
}

export async function updateTempleInfo(info: Partial<TempleInfo>): Promise<TempleInfo> {
  const res = await fetch('/api/temple-info', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(info),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update temple info');
  return data.templeInfo;
}

// ----------------------------------------------------------------------
// POOJA TIMINGS
// ----------------------------------------------------------------------
export async function fetchPoojaTimings(): Promise<PoojaTiming[]> {
  const res = await fetch('/api/pooja-timings');
  if (!res.ok) throw new Error('Failed to load pooja timings');
  return res.json();
}

export async function updatePoojaTimings(timings: PoojaTiming[]): Promise<PoojaTiming[]> {
  const res = await fetch('/api/pooja-timings', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(timings),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update timings');
  return data.poojaTimings;
}

// ----------------------------------------------------------------------
// POOJAS CRUD
// ----------------------------------------------------------------------
export async function fetchPoojas(): Promise<Pooja[]> {
  const res = await fetch('/api/poojas');
  if (!res.ok) throw new Error('Failed to fetch poojas');
  return res.json();
}

export async function createPooja(pooja: Omit<Pooja, 'id'>): Promise<Pooja> {
  const res = await fetch('/api/poojas', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(pooja),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create pooja');
  return data.pooja;
}

export async function updatePooja(id: string, pooja: Partial<Pooja>): Promise<Pooja> {
  const res = await fetch(`/api/poojas/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(pooja),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update pooja');
  return data.pooja;
}

export async function deletePooja(id: string): Promise<void> {
  const res = await fetch(`/api/poojas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete pooja');
  }
}

// ----------------------------------------------------------------------
// FESTIVALS CRUD
// ----------------------------------------------------------------------
export async function fetchFestivals(): Promise<Festival[]> {
  const res = await fetch('/api/festivals');
  if (!res.ok) throw new Error('Failed to fetch festivals');
  return res.json();
}

export async function createFestival(fest: Omit<Festival, 'id'>): Promise<Festival> {
  const res = await fetch('/api/festivals', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(fest),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create festival');
  return data.festival;
}

export async function updateFestival(id: string, fest: Partial<Festival>): Promise<Festival> {
  const res = await fetch(`/api/festivals/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(fest),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update festival');
  return data.festival;
}

export async function deleteFestival(id: string): Promise<void> {
  const res = await fetch(`/api/festivals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete festival');
  }
}

// ----------------------------------------------------------------------
// GALLERY CRUD
// ----------------------------------------------------------------------
export async function fetchGallery(): Promise<GalleryImage[]> {
  const res = await fetch('/api/gallery');
  if (!res.ok) throw new Error('Failed to load gallery');
  return res.json();
}

export async function addGalleryImage(img: Omit<GalleryImage, 'id'>): Promise<GalleryImage> {
  const res = await fetch('/api/gallery', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(img),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add image');
  return data.image;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const res = await fetch(`/api/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete image');
  }
}

// ----------------------------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------------------------
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await fetch('/api/announcements');
  if (!res.ok) throw new Error('Failed to fetch announcements');
  return res.json();
}

export async function createAnnouncement(ann: Omit<Announcement, 'id' | 'date'>): Promise<Announcement> {
  const res = await fetch('/api/announcements', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(ann),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to post announcement');
  return data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const res = await fetch(`/api/announcements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete announcement');
  }
}

// ----------------------------------------------------------------------
// BOOKINGS
// ----------------------------------------------------------------------
export async function createBooking(bookingData: Partial<Booking>): Promise<{ success: boolean; booking: Booking; message: string }> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to complete booking');
  return data;
}

export async function lookupBooking(query: string): Promise<Booking[]> {
  const res = await fetch(`/api/bookings/lookup/${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No booking found');
  return data.bookings;
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const res = await fetch('/api/bookings', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
}

export async function updateBookingStatus(id: string, update: Partial<Booking>): Promise<Booking> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(update),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update booking');
  return data.booking;
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to delete booking');
  }
}

// ----------------------------------------------------------------------
// DONATIONS
// ----------------------------------------------------------------------
export async function submitDonation(donationData: any): Promise<{ success: boolean; donation: Donation; message: string }> {
  const res = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donationData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment verification failed');
  return data;
}

export async function fetchDonationReceipt(receiptNo: string): Promise<{ donation: Donation; templeInfo: TempleInfo }> {
  const res = await fetch(`/api/donations/receipt/${encodeURIComponent(receiptNo)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Receipt not found');
  return data;
}

export async function fetchAllDonations(): Promise<Donation[]> {
  const res = await fetch('/api/donations', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load donations');
  return res.json();
}

// ----------------------------------------------------------------------
// CONTACT
// ----------------------------------------------------------------------
export async function submitContact(form: Partial<ContactEnquiry>): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send message');
  return data;
}

export async function fetchEnquiries(): Promise<ContactEnquiry[]> {
  const res = await fetch('/api/contact', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load enquiries');
  return res.json();
}

// ----------------------------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------------------------
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/stats', {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}
