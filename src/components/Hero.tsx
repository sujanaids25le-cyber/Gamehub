import React from 'react';
import { Search, MapPin, Sparkles, CheckCircle2, ShieldCheck, Zap, Trophy, Gamepad2, ArrowRight } from 'lucide-react';
import { ServiceType } from '../types';

interface HeroProps {
  onSelectService: (service: 'all' | 'sports' | 'gaming') => void;
  selectedService: 'all' | 'sports' | 'gaming';
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSelectService,
  selectedService,
  searchQuery,
  onSearchChange,
  onScrollToSection,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/60">
      {/* Decorative background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-brand-100/40 via-blue-100/30 to-purple-100/40 blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Playo-inspired badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold shadow-xs">
            <Sparkles size={14} className="text-brand-600 animate-pulse" />
            <span>India's Premier Sports Turf & Gaming Lounge Booking Network</span>
          </div>
        </div>

        {/* Main Heading & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-display">
            One Hub. <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-blue bg-clip-text text-transparent">Two Ways to Play.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-600 font-normal leading-relaxed">
            Discover sports venues and gaming centres. Book your favourite slot in seconds.
          </p>
        </div>

        {/* Two Way Service Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-10">
          {/* Card 1: Offline Sports */}
          <div
            onClick={() => onScrollToSection('offline-sports')}
            className={`group cursor-pointer p-6 rounded-2xl bg-white border transition-all duration-300 shadow-card hover:shadow-card-hover relative overflow-hidden ${
              selectedService === 'sports' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ⚽
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Outdoor & Indoor
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              <span>Offline Sports Booking</span>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </h3>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Book professional cricket grounds, FIFA-grade football turfs, synthetic badminton courts, basketball, and tennis arenas.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['Football Turfs', 'Cricket Grounds', 'Badminton Courts', 'Box Cricket', 'Tennis'].map(tag => (
                <span key={tag} className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Online Gaming Centres */}
          <div
            onClick={() => onScrollToSection('online-gaming-centres')}
            className={`group cursor-pointer p-6 rounded-2xl bg-white border transition-all duration-300 shadow-card hover:shadow-card-hover relative overflow-hidden ${
              selectedService === 'gaming' ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200/80 hover:border-brand-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎮
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                Hardware & Lounges
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center justify-between">
              <span>Online Gaming-Centre Booking</span>
              <ArrowRight size={18} className="text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </h3>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Reserve physical high-end PC gaming stations (RTX 4090), private PS5/Xbox rooms, VR arcades, and motion sim racing cockpits.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              {['PC Gaming Rigs', 'PlayStation Suites', 'Xbox Stations', 'VR Centres', 'Sim Racing'].map(tag => (
                <span key={tag} className="text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Search & Filter Bar */}
        <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1 w-full px-3 py-1">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by venue name, sport type, or gaming gear..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onSelectService('all')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedService === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Venues
            </button>
            <button
              onClick={() => onSelectService('sports')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedService === 'sports'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Sports
            </button>
            <button
              onClick={() => onSelectService('gaming')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedService === 'gaming'
                  ? 'bg-brand-600 text-white'
                  : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}
            >
              Gaming
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Instant Slot Confirmation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-brand-600" />
            <span>100% Verified Turfs & Arenas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-amber-500" />
            <span>Free Cancellation Up to 2h Prior</span>
          </div>
        </div>
      </div>
    </section>
  );
};
