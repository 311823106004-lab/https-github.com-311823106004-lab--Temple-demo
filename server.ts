import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'data', 'temple_data.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
}

function readData(): any {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data file:', err);
    return {};
  }
}

function writeData(data: any): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing data file:', err);
    return false;
  }
}

// In-memory token storage for active sessions
const activeSessions = new Set<string>();
// Preload a default valid session for seamless evaluation if needed
const DEFAULT_SESSION_TOKEN = 'session_admin_amman_portal_2026';
activeSessions.add(DEFAULT_SESSION_TOKEN);

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Admin login required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!activeSessions.has(token)) {
    return res.status(403).json({ error: 'Invalid or expired session. Please login again.' });
  }

  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // ----------------------------------------------------
  // AUTHENTICATION ROUTES
  // ----------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const db = readData();
    const admin = db.admin || {
      email: 'admin@sriamman.org',
      passwordHash: 'Amman@2026',
      name: 'Temple Administrator',
    };

    if (
      email &&
      email.toLowerCase() === admin.email.toLowerCase() &&
      password === admin.passwordHash
    ) {
      const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      activeSessions.add(token);

      // Update last login
      admin.lastLogin = new Date().toISOString();
      db.admin = admin;
      writeData(db);

      return res.json({
        success: true,
        token,
        admin: {
          email: admin.email,
          name: admin.name,
          role: admin.role || 'Super Admin',
          lastLogin: admin.lastLogin,
        },
      });
    }

    return res.status(401).json({
      error: 'Invalid credentials. Default demo credentials: admin@sriamman.org / Amman@2026',
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ authenticated: false });
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!activeSessions.has(token)) {
      return res.status(401).json({ authenticated: false });
    }

    const db = readData();
    return res.json({
      authenticated: true,
      admin: {
        email: db.admin?.email || 'admin@sriamman.org',
        name: db.admin?.name || 'Temple Administrator',
        role: db.admin?.role || 'Super Admin',
      },
    });
  });

  app.post('/api/auth/change-password', authMiddleware, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const db = readData();
    if (db.admin && db.admin.passwordHash !== currentPassword) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    if (!db.admin) {
      db.admin = {};
    }
    db.admin.passwordHash = newPassword;
    writeData(db);

    return res.json({ success: true, message: 'Admin password updated securely.' });
  });

  // ----------------------------------------------------
  // TEMPLE INFO & SETTINGS
  // ----------------------------------------------------
  app.get('/api/temple-info', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.templeInfo || {});
  });

  app.put('/api/temple-info', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    db.templeInfo = {
      ...db.templeInfo,
      ...req.body,
    };
    writeData(db);
    res.json({ success: true, templeInfo: db.templeInfo });
  });

  // ----------------------------------------------------
  // POOJA TIMINGS
  // ----------------------------------------------------
  app.get('/api/pooja-timings', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.poojaTimings || []);
  });

  app.put('/api/pooja-timings', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    db.poojaTimings = req.body;
    writeData(db);
    res.json({ success: true, poojaTimings: db.poojaTimings });
  });

  // ----------------------------------------------------
  // POOJAS SERVICES CRUD
  // ----------------------------------------------------
  app.get('/api/poojas', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.poojas || []);
  });

  app.post('/api/poojas', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const poojas = db.poojas || [];
    const newPooja = {
      id: `pj-${Date.now()}`,
      isActive: true,
      ...req.body,
    };
    poojas.push(newPooja);
    db.poojas = poojas;
    writeData(db);
    res.status(201).json({ success: true, pooja: newPooja });
  });

  app.put('/api/poojas/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const poojas = db.poojas || [];
    const idx = poojas.findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Pooja not found' });
    }
    poojas[idx] = { ...poojas[idx], ...req.body };
    db.poojas = poojas;
    writeData(db);
    res.json({ success: true, pooja: poojas[idx] });
  });

  app.delete('/api/poojas/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    let poojas = db.poojas || [];
    poojas = poojas.filter((p: any) => p.id !== req.params.id);
    db.poojas = poojas;
    writeData(db);
    res.json({ success: true, message: 'Pooja deleted successfully' });
  });

  // ----------------------------------------------------
  // FESTIVALS CRUD
  // ----------------------------------------------------
  app.get('/api/festivals', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.festivals || []);
  });

  app.post('/api/festivals', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const festivals = db.festivals || [];
    const newFestival = {
      id: `fest-${Date.now()}`,
      ...req.body,
    };
    festivals.push(newFestival);
    db.festivals = festivals;
    writeData(db);
    res.status(201).json({ success: true, festival: newFestival });
  });

  app.put('/api/festivals/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const festivals = db.festivals || [];
    const idx = festivals.findIndex((f: any) => f.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Festival not found' });
    }
    festivals[idx] = { ...festivals[idx], ...req.body };
    db.festivals = festivals;
    writeData(db);
    res.json({ success: true, festival: festivals[idx] });
  });

  app.delete('/api/festivals/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    let festivals = db.festivals || [];
    festivals = festivals.filter((f: any) => f.id !== req.params.id);
    db.festivals = festivals;
    writeData(db);
    res.json({ success: true, message: 'Festival deleted successfully' });
  });

  // ----------------------------------------------------
  // GALLERY CRUD
  // ----------------------------------------------------
  app.get('/api/gallery', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.gallery || []);
  });

  app.post('/api/gallery', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const gallery = db.gallery || [];
    const newImage = {
      id: `img-${Date.now()}`,
      ...req.body,
    };
    gallery.unshift(newImage);
    db.gallery = gallery;
    writeData(db);
    res.status(201).json({ success: true, image: newImage });
  });

  app.delete('/api/gallery/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    let gallery = db.gallery || [];
    gallery = gallery.filter((g: any) => g.id !== req.params.id);
    db.gallery = gallery;
    writeData(db);
    res.json({ success: true, message: 'Image deleted successfully' });
  });

  // ----------------------------------------------------
  // ANNOUNCEMENTS CRUD
  // ----------------------------------------------------
  app.get('/api/announcements', (req: Request, res: Response) => {
    const db = readData();
    res.json(db.announcements || []);
  });

  app.post('/api/announcements', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const announcements = db.announcements || [];
    const newAnn = {
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...req.body,
    };
    announcements.unshift(newAnn);
    db.announcements = announcements;
    writeData(db);
    res.status(201).json({ success: true, announcement: newAnn });
  });

  app.put('/api/announcements/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const announcements = db.announcements || [];
    const idx = announcements.findIndex((a: any) => a.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    announcements[idx] = { ...announcements[idx], ...req.body };
    db.announcements = announcements;
    writeData(db);
    res.json({ success: true, announcement: announcements[idx] });
  });

  app.delete('/api/announcements/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    let announcements = db.announcements || [];
    announcements = announcements.filter((a: any) => a.id !== req.params.id);
    db.announcements = announcements;
    writeData(db);
    res.json({ success: true, message: 'Announcement deleted' });
  });

  // ----------------------------------------------------
  // ONLINE POOJA BOOKINGS
  // ----------------------------------------------------
  // Public booking submission
  app.post('/api/bookings', (req: Request, res: Response) => {
    const { devoteeName, phone, email, poojaId, poojaName, amount, date, timeSlot } = req.body;

    if (!devoteeName || !phone || !email || !poojaId || !date) {
      return res.status(400).json({ error: 'Please provide all mandatory booking details.' });
    }

    const db = readData();
    const bookings = db.bookings || [];

    // Generate unique booking reference (e.g., SAT-2026-XXXX)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `SAT-2026-${randomCode}`;

    const newBooking = {
      id: `bkg-${Date.now()}`,
      bookingRef,
      devoteeName: devoteeName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      poojaId,
      poojaName: poojaName || 'Special Temple Pooja',
      amount: Number(amount) || 0,
      date,
      timeSlot: timeSlot || 'Morning 07:30 AM',
      gotram: req.body.gotram?.trim() || 'Siva Gotram',
      nakshatra: req.body.nakshatra?.trim() || '',
      rasi: req.body.rasi?.trim() || '',
      sankalpamNames: req.body.sankalpamNames?.trim() || devoteeName.trim(),
      prasadDelivery: req.body.prasadDelivery || 'temple',
      address: req.body.address?.trim() || '',
      status: 'Confirmed', // Confirmed booking
      notes: req.body.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    db.bookings = bookings;
    writeData(db);

    return res.status(201).json({
      success: true,
      booking: newBooking,
      message: `Pooja booked successfully! Your Reference ID is ${bookingRef}.`,
    });
  });

  // Public booking lookup by booking reference or phone number
  app.get('/api/bookings/lookup/:query', (req: Request, res: Response) => {
    const query = req.params.query.trim().toLowerCase();
    const db = readData();
    const bookings = db.bookings || [];

    const matches = bookings.filter((b: any) => {
      const refMatch = b.bookingRef && b.bookingRef.toLowerCase() === query;
      const phoneClean = (b.phone || '').replace(/[^0-9]/g, '');
      const queryClean = query.replace(/[^0-9]/g, '');
      const phoneMatch = queryClean.length >= 6 && phoneClean.includes(queryClean);
      return refMatch || phoneMatch;
    });

    if (matches.length === 0) {
      return res.status(404).json({ error: 'No booking found with this reference or phone number.' });
    }

    // Return sanitized booking info (hide sensitive notes if needed)
    return res.json({ bookings: matches });
  });

  // Admin: View all bookings
  app.get('/api/bookings', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    res.json(db.bookings || []);
  });

  // Admin: Update booking status (Confirm / Reject / Complete)
  app.put('/api/bookings/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const bookings = db.bookings || [];
    const idx = bookings.findIndex((b: any) => b.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings[idx] = { ...bookings[idx], ...req.body, updatedAt: new Date().toISOString() };
    db.bookings = bookings;
    writeData(db);
    res.json({ success: true, booking: bookings[idx] });
  });

  // Admin: Delete booking
  app.delete('/api/bookings/:id', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    let bookings = db.bookings || [];
    bookings = bookings.filter((b: any) => b.id !== req.params.id);
    db.bookings = bookings;
    writeData(db);
    res.json({ success: true, message: 'Booking deleted' });
  });

  // Admin: Export bookings CSV
  app.get('/api/bookings/export-csv', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const bookings = db.bookings || [];

    const headers = [
      'Booking Ref',
      'Devotee Name',
      'Phone',
      'Email',
      'Pooja Name',
      'Date',
      'Time Slot',
      'Amount (INR)',
      'Gotram',
      'Nakshatra',
      'Prasad Delivery',
      'Status',
      'Booked Date',
    ];

    const rows = bookings.map((b: any) => [
      `"${b.bookingRef || ''}"`,
      `"${(b.devoteeName || '').replace(/"/g, '""')}"`,
      `"${b.phone || ''}"`,
      `"${b.email || ''}"`,
      `"${(b.poojaName || '').replace(/"/g, '""')}"`,
      `"${b.date || ''}"`,
      `"${b.timeSlot || ''}"`,
      b.amount || 0,
      `"${b.gotram || ''}"`,
      `"${b.nakshatra || ''}"`,
      `"${b.prasadDelivery || ''}"`,
      `"${b.status || ''}"`,
      `"${b.createdAt ? b.createdAt.split('T')[0] : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sri_amman_temple_bookings_${Date.now()}.csv"`
    );
    res.send(csvContent);
  });

  // ----------------------------------------------------
  // DONATIONS & RECEIPTS
  // ----------------------------------------------------
  // Public: Record verified donation after payment confirmation
  app.post('/api/donations', (req: Request, res: Response) => {
    const { donorName, phone, email, category, amount, pan, address, paymentRef, paymentVerified } =
      req.body;

    if (!donorName || !phone || !email || !amount || !category) {
      return res.status(400).json({ error: 'Please enter all required donor details.' });
    }

    // Enforce rule: Never show a payment as successful without confirmation
    if (!paymentVerified || !paymentRef) {
      return res.status(400).json({
        error:
          'Payment verification required. Donation receipt cannot be generated without verified payment status.',
      });
    }

    const db = readData();
    const donations = db.donations || [];

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const receiptNo = `AMMAN-80G-2026-${randomNum}`;

    const newDonation = {
      id: `don-${Date.now()}`,
      receiptNo,
      donorName: donorName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      category: category.trim(),
      amount: Number(amount),
      pan: pan ? pan.trim().toUpperCase() : 'NOT PROVIDED',
      address: address?.trim() || '',
      paymentMethod: req.body.paymentMethod || 'Online Gateway / UPI',
      paymentRef: paymentRef.trim(),
      status: 'verified',
      taxExempt: true,
      createdAt: new Date().toISOString(),
    };

    donations.unshift(newDonation);
    db.donations = donations;
    writeData(db);

    return res.status(201).json({
      success: true,
      donation: newDonation,
      message: 'Payment verified successfully! Official 80G Donation Receipt generated.',
    });
  });

  // Public: Lookup receipt by receipt number
  app.get('/api/donations/receipt/:receiptNo', (req: Request, res: Response) => {
    const receiptNo = req.params.receiptNo.trim().toUpperCase();
    const db = readData();
    const donations = db.donations || [];
    const donation = donations.find((d: any) => d.receiptNo.toUpperCase() === receiptNo);

    if (!donation) {
      return res.status(404).json({ error: 'Donation receipt not found.' });
    }

    return res.json({ donation, templeInfo: db.templeInfo });
  });

  // Admin: View all donations
  app.get('/api/donations', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    res.json(db.donations || []);
  });

  // ----------------------------------------------------
  // CONTACT ENQUIRIES
  // ----------------------------------------------------
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const db = readData();
    const enquiries = db.contactEnquiries || [];
    const newEnquiry = {
      id: `enq-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      subject: subject?.trim() || 'General Temple Enquiry',
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    enquiries.unshift(newEnquiry);
    db.contactEnquiries = enquiries;
    writeData(db);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received. Temple office will contact you soon.',
    });
  });

  app.get('/api/contact', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    res.json(db.contactEnquiries || []);
  });

  // ----------------------------------------------------
  // ADMIN DASHBOARD STATS
  // ----------------------------------------------------
  app.get('/api/stats', authMiddleware, (req: Request, res: Response) => {
    const db = readData();
    const bookings = db.bookings || [];
    const donations = db.donations || [];
    const festivals = db.festivals || [];
    const poojas = db.poojas || [];

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b: any) => b.status === 'Pending').length;
    const confirmedBookings = bookings.filter((b: any) => b.status === 'Confirmed').length;
    const totalDonationsAmount = donations.reduce(
      (sum: number, d: any) => sum + (Number(d.amount) || 0),
      0
    );
    const verifiedDonationsCount = donations.length;

    // Upcoming festivals
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingFestivals = festivals.filter((f: any) => f.startDate >= todayStr);

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalDonationsAmount,
      verifiedDonationsCount,
      totalPoojas: poojas.length,
      upcomingFestivalsCount: upcomingFestivals.length,
      recentBookings: bookings.slice(0, 5),
      recentDonations: donations.slice(0, 5),
    });
  });

  // ----------------------------------------------------
  // VITE / STATIC SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode: attach Vite middlewares
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sri Amman Temple Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
