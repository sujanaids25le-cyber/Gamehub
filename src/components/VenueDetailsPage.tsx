import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Shield,
  CheckCircle2,
  Calendar,
  Tag,
  AlertTriangle,
  Info,
  Share2,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { Venue, VenueResource, Booking } from '../types';
import {
  generateNextDates,
  generateTimeSlots,
  calculateEndTime,
  applyPromoCode,
  createBooking,
  fetchResourceAvailability,
  DateOption,
  PromoResult
} from '../utils/bookingStorage';

interface VenueDetailsPageProps {
  venue: Venue;
  onBack: () => void;
  onBookingSuccess: (booking: Booking) => void;
  onGoToMyBookings: () => void;
}

export const VenueDetailsPage: React.FC<VenueDetailsPageProps> = ({
  venue,
  onBack,
  onBookingSuccess,
  onGoToMyBookings,
}) => {
  const isSports = venue.serviceType === 'sports';
  const dates = useMemo(() => generateNextDates(14), []);

  // Booking Flow State
  const [selectedDate, setSelectedDate] = useState<DateOption>(dates[0]);
  const [selectedResource, setSelectedResource] = useState<VenueResource>(
    venue.resources[0] || {
      id: 'default',
      name: 'Standard Unit',
      type: isSports ? 'Court' : 'Station',
      specs: venue.equipmentInfo || 'Standard Equipment',
      priceModifier: 0,
      isAvailable: true,
    }
  );
  const [durationHours, setDurationHours] = useState<number>(1);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string>('06:00 PM');
  const [selectedAddOns, setSelectedAddOns] = useState<{ [id: string]: number }>({});
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);

  // Customer Contact State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active bookings from backend for overlap calculation
  const [activeBookingsFromBackend, setActiveBookingsFromBackend] = useState<{ startTime: string; endTime: string }[]>([]);

  // Confirmed booking pass
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Fetch backend availability whenever resource or date changes
  useEffect(() => {
    let isMounted = true;
    fetchResourceAvailability(venue.id, selectedResource.id, selectedDate.fullDate).then(active => {
      if (isMounted) {
        setActiveBookingsFromBackend(active);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [venue.id, selectedResource.id, selectedDate.fullDate]);

  // Generate slots dynamically based on duration and backend booked intervals
  const timeSlots = useMemo(() => {
    return generateTimeSlots(durationHours, activeBookingsFromBackend);
  }, [durationHours, activeBookingsFromBackend]);

  // End time calculation
  const endTime = useMemo(() => {
    return calculateEndTime(selectedSlotTime, durationHours);
  }, [selectedSlotTime, durationHours]);

  // Automatic Price Calculation
  const baseRate = venue.pricePerHour + selectedResource.priceModifier;
  const baseTotal = baseRate * durationHours;

  const addOnsTotal = useMemo(() => {
    return Object.entries(selectedAddOns).reduce((sum, [addOnId, qty]) => {
      const item = venue.addOns.find(a => a.id === addOnId);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [selectedAddOns, venue.addOns]);

  const subtotal = baseTotal + addOnsTotal;
  const discountAmount = promoResult?.valid ? promoResult.discountAmount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxesAndFees = Math.round(taxableAmount * 0.05);
  const grandTotal = taxableAmount + taxesAndFees;

  // Add-on quantity modifier
  const handleAddOnQtyChange = (addOnId: string, delta: number) => {
    setSelectedAddOns(prev => {
      const current = prev[addOnId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[addOnId];
        return copy;
      }
      return { ...prev, [addOnId]: next };
    });
  };

  const handleApplyPromo = () => {
    if (!promoCodeInput.trim()) return;
    const res = applyPromoCode(promoCodeInput, subtotal);
    setPromoResult(res);
  };

  // Submit Booking with Real Backend Validation
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      setErrorMessage('Please enter your full name, phone number, and email address.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const prefix = isSports ? 'GH-SPT' : 'GH-GMR';
    const bookingId = `${prefix}-${randomDigits}`;

    const bookedAddOns = Object.entries(selectedAddOns).map(([id, quantity]) => {
      const item = venue.addOns.find(a => a.id === id)!;
      return { item, quantity };
    });

    const bookingPayload: Booking = {
      id: bookingId,
      venueId: venue.id,
      venueName: venue.name,
      serviceType: venue.serviceType,
      categoryLabel: venue.categoryLabel,
      venueImage: venue.image,
      location: `${venue.area}, ${venue.city.charAt(0).toUpperCase() + venue.city.slice(1)}`,
      resourceId: selectedResource.id,
      resourceName: selectedResource.name,
      resourceType: selectedResource.type,
      date: selectedDate.fullDate,
      dateFormatted: selectedDate.formatted,
      startTime: selectedSlotTime,
      endTime,
      durationHours,
      selectedAddOns: bookedAddOns,
      baseHourlyRate: venue.pricePerHour,
      resourceModifier: selectedResource.priceModifier,
      baseTotal,
      addOnsTotal,
      tax: taxesAndFees,
      discount: discountAmount,
      promoCode: promoResult?.valid ? promoResult.code : undefined,
      totalPrice: grandTotal,
      currency: venue.currency,
      customerName,
      customerEmail,
      customerPhone,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    // CALL BACKEND API TO SAVE & VALIDATE DOUBLE BOOKINGS
    const result = await createBooking(bookingPayload);
    setIsSubmitting(false);

    if (!result.success) {
      // BACKEND PREVENTED DOUBLE BOOKING
      setErrorMessage(result.message || 'Double Booking Prevented: This slot has already been reserved.');
      // Refresh backend active bookings to update time slots
      fetchResourceAvailability(venue.id, selectedResource.id, selectedDate.fullDate).then(setActiveBookingsFromBackend);
      return;
    }

    if (result.booking) {
      setConfirmedBooking(result.booking);
      onBookingSuccess(result.booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans animate-fadeIn">
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-brand-600 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to All Venues</span>
          </button>

          <div className="text-slate-400 hidden sm:block">
            <span>Venues</span> / <span className="capitalize">{venue.city}</span> / <span className="text-slate-700 font-semibold">{venue.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ======================================================== */}
        {/* CONFIRMATION TICKET PASS SCREEN                          */}
        {/* ======================================================== */}
        {confirmedBooking ? (
          <div className="max-w-2xl mx-auto py-8 space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display">Booking Confirmed!</h2>
              <p className="text-sm text-slate-500 mt-1">
                Your reservation pass has been generated and validated by the backend booking engine.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-5 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">GameHub Access Pass</div>
                  <div className="text-lg font-bold font-mono tracking-tight">{confirmedBooking.id}</div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white text-brand-700 uppercase">
                  CONFIRMED
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">{confirmedBooking.venueName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={13} className="text-brand-600" />
                    <span>{confirmedBooking.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 text-xs">
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Resource / Unit</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{confirmedBooking.resourceName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Date</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{confirmedBooking.dateFormatted}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Time Window</div>
                    <div className="font-bold text-brand-600 text-sm mt-0.5">
                      {confirmedBooking.startTime} - {confirmedBooking.endTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Duration</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{confirmedBooking.durationHours} Hour(s)</div>
                  </div>
                </div>

                {confirmedBooking.selectedAddOns.length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Equipment & Add-ons:</div>
                    <div className="flex flex-wrap gap-2">
                      {confirmedBooking.selectedAddOns.map(({ item, quantity }) => (
                        <span key={item.id} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                          {item.icon} {item.name} × {quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Booked for: </span>
                    <span className="font-bold text-slate-800">{confirmedBooking.customerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Total Price: </span>
                    <span className="font-black text-slate-900 text-xl font-display">{confirmedBooking.currency}{confirmedBooking.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-500" />
                  <span>Free cancellation up to 2 hours prior</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-600">Saved in My Bookings</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={onGoToMyBookings}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
              >
                Go to My Bookings Page
              </button>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition"
              >
                Book Another Slot
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VENUE DETAILS VIEW & EMBEDDED BOOKING SYSTEM             */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN: Venue Details, Specs, Amenities (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Photo Banner with Badges */}
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-200 shadow-sm border border-slate-200/80">
                <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                      isSports ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-brand-950/80 text-brand-300 border border-brand-500/40'
                    }`}
                  >
                    {venue.categoryLabel}
                  </span>
                  {venue.badge && (
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 border border-slate-200 shadow-sm">
                      {venue.badge}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white drop-shadow-md">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-semibold">
                    <Clock size={13} />
                    <span>{venue.timings}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-600/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold">
                    <Star size={13} className="fill-white" />
                    <span>{venue.rating}</span>
                    <span className="opacity-80 font-normal">({venue.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Title & Location Header */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    {venue.name}
                  </h1>
                  <div className="text-lg font-black text-brand-600 font-display">
                    {venue.currency}{venue.pricePerHour} <span className="text-xs font-normal text-slate-500">/ hour</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-brand-600" />
                    <span>{venue.location}, {venue.city.charAt(0).toUpperCase() + venue.city.slice(1)}</span>
                  </span>
                  {venue.phone && (
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone size={14} className="text-slate-400" />
                      <span>{venue.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">About Facility</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{venue.description}</p>
              </div>

              {/* Specifications (Court & Turf / PC Rig & Console) */}
              {venue.equipmentInfo && (
                <div className={`p-6 rounded-3xl border ${isSports ? 'bg-emerald-50/70 border-emerald-200' : 'bg-brand-50/70 border-brand-200'}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-slate-800">
                    <Shield size={16} className={isSports ? 'text-emerald-600' : 'text-brand-600'} />
                    <span>{isSports ? 'Court & Turf Technical Specifications' : 'Hardware & Rig Specifications'}</span>
                  </h3>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">{venue.equipmentInfo}</p>
                </div>
              )}

              {/* Amenities Checklist */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Included Facilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {venue.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules & Guidelines */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs text-slate-600">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Rules & Guidelines</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Please arrive 10 minutes prior to your reserved slot.</li>
                  <li>{isSports ? 'Non-marking shoes or turf studs are mandatory for court safety.' : 'No outside food or drinks near the PC battle-stations.'}</li>
                  <li>Free cancellation up to 2 hours before the session.</li>
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: The Complete Interactive Booking System (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-6">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 font-display">Book Your Slot</h2>
                    <p className="text-xs text-slate-500">Backend validated reservation engine</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                    Live Availability
                  </span>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  {/* STEP 1: RESOURCE / COURT / RIG SELECTION */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      1. {isSports ? 'Select Court / Turf' : 'Select Station / Rig'}
                    </label>
                    <div className="space-y-2">
                      {venue.resources.map(res => {
                        const isSelected = selectedResource.id === res.id;
                        return (
                          <div
                            key={res.id}
                            onClick={() => setSelectedResource(res)}
                            className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between text-left ${
                              isSelected
                                ? 'bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-xs'
                                : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{res.name}</span>
                                {isSelected && <Check size={14} className="text-brand-600" />}
                              </div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{res.specs}</div>
                            </div>
                            <div className="text-right text-[11px] shrink-0 font-bold text-slate-800">
                              {res.priceModifier > 0
                                ? `+${venue.currency}${res.priceModifier}/hr`
                                : res.priceModifier < 0
                                ? `-${venue.currency}${Math.abs(res.priceModifier)}/hr`
                                : 'Standard'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 2: DATE SELECTION */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        2. Select Date
                      </label>
                      <span className="text-[11px] font-semibold text-brand-600">{selectedDate.formatted}</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                      {dates.map(date => {
                        const isSelected = selectedDate.fullDate === date.fullDate;
                        return (
                          <button
                            type="button"
                            key={date.fullDate}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center min-w-[65px] py-2.5 rounded-xl border transition-all shrink-0 ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand-400' : 'text-slate-400'}`}>
                              {date.dayName}
                            </span>
                            <span className="text-lg font-black font-display">{date.dayNumber}</span>
                            <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {date.monthShort}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 3: DURATION & TIME SLOTS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Duration & Time Slot
                      </label>
                      {/* Duration Picker */}
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                        {[1, 2, 3, 4].map(h => (
                          <button
                            type="button"
                            key={h}
                            onClick={() => setDurationHours(h)}
                            className={`px-2 py-0.5 rounded-md text-xs font-bold transition ${
                              durationHours === h ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-2 p-2.5 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-between text-xs text-brand-900">
                      <span className="font-semibold flex items-center gap-1">
                        <Clock size={13} className="text-brand-600" />
                        Window:
                      </span>
                      <span className="font-bold font-mono">
                        {selectedSlotTime} - {endTime} ({durationHours}h)
                      </span>
                    </div>

                    {/* Slots List */}
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {(['morning', 'afternoon', 'evening', 'night'] as const).map(period => {
                        const periodSlots = timeSlots.filter(s => s.period === period);
                        if (periodSlots.length === 0) return null;

                        return (
                          <div key={period}>
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1 capitalize">
                              {period}
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {periodSlots.map(slot => {
                                const isSelected = selectedSlotTime === slot.time;
                                const isAvailable = slot.isAvailable;

                                return (
                                  <button
                                    type="button"
                                    key={slot.id}
                                    disabled={!isAvailable}
                                    onClick={() => setSelectedSlotTime(slot.time)}
                                    className={`py-1.5 px-1 rounded-xl text-xs font-semibold border transition text-center flex flex-col items-center justify-center ${
                                      !isAvailable
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50 line-through'
                                        : isSelected
                                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-400'
                                    }`}
                                  >
                                    <span>{slot.displayTime}</span>
                                    {slot.isPeak && isAvailable && (
                                      <span className={`text-[7px] font-extrabold uppercase ${isSelected ? 'text-amber-200' : 'text-amber-600'}`}>
                                        Peak
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 4: ADD-ONS */}
                  {venue.addOns.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        4. Equipment & Add-ons (Optional)
                      </label>
                      <div className="space-y-2">
                        {venue.addOns.map(addOn => {
                          const qty = selectedAddOns[addOn.id] || 0;
                          return (
                            <div
                              key={addOn.id}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                                qty > 0 ? 'bg-white border-brand-500 shadow-xs' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{addOn.icon}</span>
                                <div>
                                  <div className="font-bold text-slate-800">{addOn.name}</div>
                                  <div className="text-[10px] text-slate-500">{venue.currency}{addOn.price}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {qty > 0 ? (
                                  <div className="flex items-center gap-2 bg-slate-100 p-0.5 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => handleAddOnQtyChange(addOn.id, -1)}
                                      className="w-5 h-5 rounded bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 font-bold"
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="text-xs font-bold text-slate-900 w-3 text-center">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleAddOnQtyChange(addOn.id, 1)}
                                      className="w-5 h-5 rounded bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 font-bold"
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOnQtyChange(addOn.id, 1)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-brand-50 hover:text-brand-600 text-slate-700 border border-slate-200 transition"
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: CONTACT & PROMO CODE */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      5. Player Information
                    </label>

                    <div className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Your Full Name *"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number *"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email Address *"
                          value={customerEmail}
                          onChange={e => setCustomerEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    {/* Promo Code Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. GAMEHUB50)"
                          value={promoCodeInput}
                          onChange={e => setPromoCodeInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-800 uppercase font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        Apply
                      </button>
                    </div>

                    {promoResult && (
                      <div className={`text-[11px] font-semibold ${promoResult.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                        {promoResult.message}
                      </div>
                    )}
                  </div>

                  {/* AUTOMATIC TOTAL PRICE BREAKDOWN */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Rate ({selectedResource.name} × {durationHours}h):</span>
                      <span className="font-mono font-bold text-slate-800">{venue.currency}{baseTotal}</span>
                    </div>

                    {addOnsTotal > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Equipment & Add-ons:</span>
                        <span className="font-mono font-bold text-slate-800">{venue.currency}{addOnsTotal}</span>
                      </div>
                    )}

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount ({promoResult?.code}):</span>
                        <span className="font-mono font-bold">-{venue.currency}{discountAmount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Platform Fee & Tax (5%):</span>
                      <span className="font-mono">{venue.currency}{taxesAndFees}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs font-extrabold text-slate-900 font-display">Grand Total</span>
                      <span className="text-xl font-black text-brand-600 font-display">
                        {venue.currency}{grandTotal}
                      </span>
                    </div>
                  </div>

                  {/* ERROR / BACKEND CONFLICT ALERT */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Booking Error</div>
                        <div>{errorMessage}</div>
                      </div>
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Validating with Backend...' : 'Confirm & Reserve Slot'}</span>
                    <ChevronRight size={16} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
