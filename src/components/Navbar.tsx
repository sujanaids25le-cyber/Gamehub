import React, { useState } from 'react';
import { MapPin, Search, ChevronDown, User, Menu, X, PhoneCall, Ticket } from 'lucide-react';
import { CITIES } from '../data/venues';

interface NavbarProps {
  selectedCity: string;
  onCityChange: (cityId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectServiceType: (service: 'all' | 'sports' | 'gaming') => void;
  selectedServiceType: 'all' | 'sports' | 'gaming';
  bookingsCount: number;
  onOpenMyBookings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCity,
  onCityChange,
  searchQuery,
  onSearchChange,
  onSelectServiceType,
  selectedServiceType,
  bookingsCount,
  onOpenMyBookings,
}) => {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCityName = CITIES.find(c => c.id === selectedCity)?.name || 'All Locations';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & City Picker */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-blue flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">GH</span>
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1 font-display">
                <span>GAME</span>
                <span className="text-brand-600">HUB</span>
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Sports & Gaming Venues
              </div>
            </div>
          </a>

          {/* City Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsCityDropdownOpen(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-500/50 bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <MapPin size={14} className="text-brand-600" />
              <span>{activeCityName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-44 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Location
                </div>
                {CITIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onCityChange(c.id);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                      selectedCity === c.id ? 'text-brand-600 font-bold bg-brand-50/60' : 'text-slate-600'
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedCity === c.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cricket grounds, football turfs, PC lounges, PS5..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-brand-500 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition"
            />
          </div>
        </div>

        {/* Right: Navigation items & User CTA */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onSelectServiceType('sports')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedServiceType === 'sports'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Offline Sports
            </button>
            <button
              onClick={() => onSelectServiceType('gaming')}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedServiceType === 'gaming'
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              Gaming Centres
            </button>
          </nav>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          {/* My Bookings Button */}
          <button
            onClick={onOpenMyBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 transition border border-slate-200"
          >
            <Ticket size={14} className="text-brand-600" />
            <span>My Bookings</span>
            {bookingsCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {bookingsCount}
              </span>
            )}
          </button>

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition">
            <User size={14} />
            <span>Sign In</span>
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenMyBookings}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 relative"
          >
            <Ticket size={18} />
            {bookingsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-600"></span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-3">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search turfs, courts, gaming lounges..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-800"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onSelectServiceType('sports');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-slate-100 text-slate-800"
            >
              Offline Sports
            </button>
            <button
              onClick={() => {
                onSelectServiceType('gaming');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-lg bg-slate-100 text-slate-800"
            >
              Gaming Centres
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">City: {activeCityName}</span>
            <button
              onClick={() => {
                onOpenMyBookings();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
            >
              My Bookings ({bookingsCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
