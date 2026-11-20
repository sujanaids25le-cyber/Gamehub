export type ServiceType = 'sports' | 'gaming';

export type SportsCategory =
  | 'cricket'
  | 'football'
  | 'badminton'
  | 'basketball'
  | 'tennis'
  | 'box-cricket';

export type GamingCategory =
  | 'pc-gaming'
  | 'playstation'
  | 'xbox'
  | 'vr-gaming'
  | 'esports-arena'
  | 'sim-racing';

export type VenueCategory = SportsCategory | GamingCategory;

export interface VenueResource {
  id: string;
  name: string;
  type: string; // e.g. "Pitch", "Court", "Cage", "PC Rig", "Console Suite", "Cockpit", "VR Arena"
  specs: string; // e.g. "Natural Clay Wicket", "RTX 4090 24GB + 360Hz", "75\" OLED + DualSense"
  priceModifier: number; // additional cost per hour (e.g. +0, +100 for VIP)
  isAvailable: boolean;
}

export interface AddOnItem {
  id: string;
  name: string;
  price: number;
  category: 'equipment' | 'refreshment' | 'assistance';
  icon: string;
}

export interface Venue {
  id: string;
  name: string;
  serviceType: ServiceType;
  category: VenueCategory;
  categoryLabel: string;
  image: string;
  gallery?: string[];
  location: string;
  city: string;
  area: string;
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  currency: string;
  badge?: string;
  amenities: string[];
  equipmentInfo?: string;
  timings: string;
  description: string;
  phone?: string;
  resources: VenueResource[];
  addOns: AddOnItem[];
}

export interface CityOption {
  id: string;
  name: string;
}

export interface TimeSlot {
  id: string;
  time: string; // "06:00 AM", "07:00 AM", etc.
  displayTime: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  isAvailable: boolean;
  isPeak: boolean;
}

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  serviceType: ServiceType;
  categoryLabel: string;
  venueImage: string;
  location: string;
  resourceId: string;
  resourceName: string;
  resourceType: string;
  date: string; // e.g. "2026-11-21"
  dateFormatted: string; // e.g. "Sat, 21 Nov 2026"
  startTime: string; // "06:00 PM"
  endTime: string; // "08:00 PM"
  durationHours: number;
  selectedAddOns: { item: AddOnItem; quantity: number }[];
  baseHourlyRate: number;
  resourceModifier: number;
  baseTotal: number;
  addOnsTotal: number;
  tax: number;
  discount: number;
  promoCode?: string;
  totalPrice: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
}
