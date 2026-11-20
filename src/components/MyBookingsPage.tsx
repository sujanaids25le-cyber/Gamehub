import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Ticket, ShieldCheck, AlertCircle, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Booking } from '../types';

interface MyBookingsPageProps {
  bookings: Booking[];
  onBack: () => void;
  onCancelBooking: (bookingId: string) => void;
  onExploreVenues: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  onBack,
  onCancelBooking,
  onExploreVenues,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'sports' | 'gaming'>('all');

  const filteredBookings = bookings.filter(b => {
    if (filterType === 'all') return true;
    return b.serviceType === filterType;
  });

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans animate-fadeIn">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-brand-600 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Venues</span>
          </button>

          <span className="text-slate-400">Account / My Bookings</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display">
              My Bookings & Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live reservations validated and saved across sports turfs and gaming centres.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilterType('sports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'sports' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sports
            </button>
            <button
              onClick={() => setFilterType('gaming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'gaming' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gaming
            </button>
          </div>
        </div>

        {/* Summary Metric Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</div>
            <div className="text-2xl font-black text-slate-900 font-display mt-0.5">{bookings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active Passes</div>
            <div className="text-2xl font-black text-emerald-600 font-display mt-0.5">{confirmedCount}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cancelled</div>
            <div className="text-2xl font-black text-slate-500 font-display mt-0.5">{cancelledCount}</div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(booking => {
              const isSports = booking.serviceType === 'sports';
              const isCancelled = booking.status === 'cancelled';

              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs hover:shadow-card ${
                    isCancelled ? 'border-slate-200 opacity-60' : 'border-slate-200'
                  }`}
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-start justify-between">
                    <div className="flex gap-4">
                      {/* Venue Image Thumbnail */}
                      <img
                        src={booking.venueImage}
                        alt={booking.venueName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 bg-slate-100"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md">
                            {booking.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isSports ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-50 text-brand-700'
                            }`}
                          >
                            {booking.categoryLabel}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {booking.status.toUpperCase()}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 font-display">{booking.venueName}</h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={13} className="text-brand-600" />
                          <span>{booking.location}</span>
                        </div>

                        <div className="text-xs text-slate-700 font-semibold pt-1">
                          Unit / Rig: <span className="text-brand-600">{booking.resourceName}</span> ({booking.resourceType})
                        </div>
                      </div>
                    </div>

                    {/* Booking Details & Pricing Box */}
                    <div className="w-full md:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between shrink-0 text-xs space-y-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{booking.dateFormatted}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-600 font-bold mt-1">
                          <Clock size={13} />
                          <span>{booking.startTime} - {booking.endTime} ({booking.durationHours}h)</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between gap-4">
                        <span className="text-slate-500">Total Price:</span>
                        <span className="text-lg font-black text-slate-900 font-display">
                          {booking.currency}{booking.totalPrice}
                        </span>
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
                              onCancelBooking(booking.id);
                            }
                          }}
                          className="pt-1 text-[11px] font-bold text-red-600 hover:text-red-700 text-right hover:underline"
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
              <Ticket size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Bookings Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't reserved any sports courts or gaming stations in this view yet.
              </p>
              <button
                onClick={onExploreVenues}
                className="mt-4 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition shadow-sm"
              >
                Explore Venues & Book Slot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
