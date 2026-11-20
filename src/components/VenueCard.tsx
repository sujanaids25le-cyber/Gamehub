import React from 'react';
import { MapPin, Star, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Venue } from '../types';

interface VenueCardProps {
  venue: Venue;
  onViewDetails: (venue: Venue) => void;
  onBookNow?: (venue: Venue) => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onViewDetails, onBookNow }) => {
  const isSports = venue.serviceType === 'sports';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      <div className="cursor-pointer" onClick={() => onViewDetails(venue)}>
        {/* Venue Image & Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Service & Category Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                isSports
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'bg-brand-950/80 text-brand-300 border border-brand-500/30'
              }`}
            >
              {venue.categoryLabel}
            </span>
          </div>

          {/* Special Status Badge */}
          {venue.badge && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 border border-slate-200/60 shadow-sm">
                {venue.badge}
              </span>
            </div>
          )}

          {/* Operating Hours Overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white/95 drop-shadow-md">
            <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2 py-0.5 rounded-md">
              <Clock size={12} className="text-slate-300" />
              {venue.timings}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5">
          {/* Rating & Location Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin size={14} className="text-brand-600 shrink-0" />
              <span className="truncate">{venue.area}, {venue.city.charAt(0).toUpperCase() + venue.city.slice(1)}</span>
            </div>

            {/* Rating pill */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
              <Star size={12} className="fill-emerald-600 text-emerald-600" />
              <span>{venue.rating}</span>
              <span className="text-[10px] text-emerald-600/70 font-normal">({venue.reviewCount})</span>
            </div>
          </div>

          {/* Venue Name */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2 font-display">
            {venue.name}
          </h4>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {venue.description}
          </p>

          {/* Amenities Pills Preview */}
          <div className="flex flex-wrap gap-1.5 mb-1">
            {venue.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                +{venue.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Price per hour & Action buttons */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Starting From</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
              {venue.currency}{venue.pricePerHour}
            </span>
            <span className="text-xs font-medium text-slate-500">/ hour</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onViewDetails(venue)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              isSports
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
