import { Booking, TimeSlot } from '../types';

const STORAGE_KEY = 'gamehub_user_bookings';

// Local storage fallback
export const getLocalBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load bookings from localStorage', err);
    return [];
  }
};

export const saveLocalBooking = (booking: Booking): void => {
  try {
    const current = getLocalBookings();
    const updated = [booking, ...current.filter(b => b.id !== booking.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save booking to localStorage', err);
  }
};

// API: Fetch all bookings from backend
export const fetchAllBookings = async (): Promise<Booking[]> => {
  try {
    const res = await fetch('/api/bookings');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn('Backend API unavailable, using local cache', e);
  }
  return getLocalBookings();
};

// API: Check availability for specific venue, resource, and date
export const fetchResourceAvailability = async (
  venueId: string,
  resourceId: string,
  date: string
): Promise<{ startTime: string; endTime: string }[]> => {
  try {
    const res = await fetch(`/api/availability?venueId=${encodeURIComponent(venueId)}&resourceId=${encodeURIComponent(resourceId)}&date=${encodeURIComponent(date)}`);
    if (res.ok) {
      const data = await res.json();
      return data.activeBookings || [];
    }
  } catch (e) {
    console.warn('Failed to fetch availability from backend', e);
  }

  // Fallback to local bookings
  const local = getLocalBookings();
  return local
    .filter(b => b.status === 'confirmed' && b.venueId === venueId && b.resourceId === resourceId && b.date === date)
    .map(b => ({ startTime: b.startTime, endTime: b.endTime }));
};

export interface BookingSubmissionResult {
  success: boolean;
  booking?: Booking;
  isConflict?: boolean;
  message?: string;
}

// API: Create booking with BACKEND DOUBLE-BOOKING VALIDATION
export const createBooking = async (booking: Booking): Promise<BookingSubmissionResult> => {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });

    if (res.status === 409) {
      // BACKEND PREVENTED DOUBLE BOOKING!
      const data = await res.json();
      return {
        success: false,
        isConflict: true,
        message: data.message || 'Double Booking Prevented: This slot is already booked.',
      };
    }

    if (res.ok) {
      const data = await res.json();
      saveLocalBooking(data.booking);
      return { success: true, booking: data.booking };
    }
  } catch (err) {
    console.error('Network error during booking submission', err);
  }

  // Fallback: check local bookings for double booking
  const local = getLocalBookings();
  const conflict = local.find(b => {
    if (b.status !== 'confirmed') return false;
    if (b.venueId !== booking.venueId || b.resourceId !== booking.resourceId || b.date !== booking.date) return false;
    return checkTimeOverlap(booking.startTime, booking.endTime, b.startTime, b.endTime);
  });

  if (conflict) {
    return {
      success: false,
      isConflict: true,
      message: `Double Booking Prevented: This resource is already booked from ${conflict.startTime} to ${conflict.endTime}.`,
    };
  }

  saveLocalBooking(booking);
  return { success: true, booking };
};

// API: Cancel booking
export const requestCancelBooking = async (bookingId: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok) {
      const local = getLocalBookings();
      const target = local.find(b => b.id === bookingId);
      if (target) target.status = 'cancelled';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
      return true;
    }
  } catch (err) {
    console.error('Cancel booking API failed', err);
  }

  // Fallback
  const local = getLocalBookings();
  const target = local.find(b => b.id === bookingId);
  if (!target) return false;
  target.status = 'cancelled';
  localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  return true;
};

// Date options generation for date strip
export interface DateOption {
  fullDate: string; // "2026-11-20"
  formatted: string; // "Fri, 20 Nov 2026"
  dayName: string; // "Today", "Tomorrow", "Sat", "Sun"
  dayNumber: number; // 20
  monthShort: string; // "Nov"
  isWeekend: boolean;
}

export const generateNextDates = (count = 14): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let dayName = days[d.getDay()];
    if (i === 0) dayName = 'Today';
    else if (i === 1) dayName = 'Tomorrow';

    dates.push({
      fullDate,
      formatted: `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${year}`,
      dayName,
      dayNumber: d.getDate(),
      monthShort: months[d.getMonth()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  return dates;
};

// Helper: Convert time string "06:00 PM" into minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  if (parts.length < 2) return 0;
  const [hoursStr, minutesStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10) || 0;
  const modifier = parts[1].toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Helper: check overlap between [startA, endA) and [startB, endB)
export const checkTimeOverlap = (startA: string, endA: string, startB: string, endB: string): boolean => {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
};

// Time slots generation with overlap detection against existing bookings
export const generateTimeSlots = (
  durationHours = 1,
  activeBookings: { startTime: string; endTime: string }[] = []
): TimeSlot[] => {
  const baseTimes = [
    // Morning (06:00 AM - 12:00 PM)
    { id: '06-00', time: '06:00 AM', displayTime: '06:00 AM', period: 'morning', isPeak: false },
    { id: '07-00', time: '07:00 AM', displayTime: '07:00 AM', period: 'morning', isPeak: false },
    { id: '08-00', time: '08:00 AM', displayTime: '08:00 AM', period: 'morning', isPeak: false },
    { id: '09-00', time: '09:00 AM', displayTime: '09:00 AM', period: 'morning', isPeak: false },
    { id: '10-00', time: '10:00 AM', displayTime: '10:00 AM', period: 'morning', isPeak: false },
    { id: '11-00', time: '11:00 AM', displayTime: '11:00 AM', period: 'morning', isPeak: false },

    // Afternoon (12:00 PM - 05:00 PM)
    { id: '12-00', time: '12:00 PM', displayTime: '12:00 PM', period: 'afternoon', isPeak: false },
    { id: '13-00', time: '01:00 PM', displayTime: '01:00 PM', period: 'afternoon', isPeak: false },
    { id: '14-00', time: '02:00 PM', displayTime: '02:00 PM', period: 'afternoon', isPeak: false },
    { id: '15-00', time: '03:00 PM', displayTime: '03:00 PM', period: 'afternoon', isPeak: false },
    { id: '16-00', time: '04:00 PM', displayTime: '04:00 PM', period: 'afternoon', isPeak: false },

    // Evening (05:00 PM - 09:00 PM) - Peak hours
    { id: '17-00', time: '05:00 PM', displayTime: '05:00 PM', period: 'evening', isPeak: true },
    { id: '18-00', time: '06:00 PM', displayTime: '06:00 PM', period: 'evening', isPeak: true },
    { id: '19-00', time: '07:00 PM', displayTime: '07:00 PM', period: 'evening', isPeak: true },
    { id: '20-00', time: '08:00 PM', displayTime: '08:00 PM', period: 'evening', isPeak: true },

    // Night (09:00 PM - 12:00 AM)
    { id: '21-00', time: '09:00 PM', displayTime: '09:00 PM', period: 'night', isPeak: true },
    { id: '22-00', time: '10:00 PM', displayTime: '10:00 PM', period: 'night', isPeak: false },
    { id: '23-00', time: '11:00 PM', displayTime: '11:00 PM', period: 'night', isPeak: false },
  ] as const;

  return baseTimes.map(s => {
    const slotEndTime = calculateEndTime(s.time, durationHours);
    // Check if [s.time, slotEndTime) overlaps with ANY existing confirmed booking
    const hasConflict = activeBookings.some(b => checkTimeOverlap(s.time, slotEndTime, b.startTime, b.endTime));

    return {
      id: s.id,
      time: s.time,
      displayTime: s.displayTime,
      period: s.period,
      isAvailable: !hasConflict,
      isPeak: s.isPeak,
    };
  });
};

export const calculateEndTime = (startTime: string, durationHours: number): string => {
  const [timePart, modifier] = startTime.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  hours = (hours + durationHours) % 24;

  const newModifier = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${newModifier}`;
};

export interface PromoResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}

export const applyPromoCode = (code: string, subtotal: number): PromoResult => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, code: '', discountAmount: 0, message: '' };
  }

  if (normalized === 'GAMEHUB50' || normalized === 'PLAYO50') {
    const discount = Math.round(subtotal * 0.1); // 10% off
    return { valid: true, code: normalized, discountAmount: discount, message: '10% Squad Discount Applied!' };
  }

  if (normalized === 'FIRSTPLAY' || normalized === 'WELCOME100') {
    const discount = Math.min(150, subtotal);
    return { valid: true, code: normalized, discountAmount: discount, message: '₹150 Welcome Bonus Applied!' };
  }

  if (normalized === 'WEEKEND') {
    const discount = Math.round(subtotal * 0.15);
    return { valid: true, code: normalized, discountAmount: discount, message: '15% Weekend Saver Applied!' };
  }

  return { valid: false, code: normalized, discountAmount: 0, message: 'Invalid or expired promo code.' };
};
