import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VenueCard } from './components/VenueCard';
import { VenueDetailsPage } from './components/VenueDetailsPage';
import { MyBookingsPage } from './components/MyBookingsPage';
import { FeaturesBanner } from './components/FeaturesBanner';
import { Footer } from './components/Footer';
import { VENUES, SPORTS_CATEGORIES, GAMING_CATEGORIES } from './data/venues';
import { Venue, Booking } from './types';
import { fetchAllBookings, requestCancelBooking } from './utils/bookingStorage';
import { Trophy, Gamepad2 } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'venue-details' | 'my-bookings'>('home');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<'all' | 'sports' | 'gaming'>('all');
  const [selectedSportsCategory, setSelectedSportsCategory] = useState<string>('all');
  const [selectedGamingCategory, setSelectedGamingCategory] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load existing bookings from backend on mount
  useEffect(() => {
    fetchAllBookings().then(setBookings);
  }, []);

  const handleBookingSuccess = (newBooking: Booking) => {
    fetchAllBookings().then(setBookings);
  };

  const handleCancelBooking = async (bookingId: string) => {
    const success = await requestCancelBooking(bookingId);
    if (success) {
      fetchAllBookings().then(setBookings);
    }
  };

  const handleSelectVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setCurrentView('venue-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToMyBookings = () => {
    setCurrentView('my-bookings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter venues
  const filterVenues = (venuesList: Venue[]) => {
    return venuesList.filter(venue => {
      // City filter
      if (selectedCity !== 'all' && venue.city !== selectedCity) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = venue.name.toLowerCase().includes(query);
        const matchesLocation = venue.location.toLowerCase().includes(query) || venue.area.toLowerCase().includes(query);
        const matchesCategory = venue.categoryLabel.toLowerCase().includes(query) || venue.category.toLowerCase().includes(query);
        const matchesAmenities = venue.amenities.some(a => a.toLowerCase().includes(query));
        if (!matchesName && !matchesLocation && !matchesCategory && !matchesAmenities) {
          return false;
        }
      }

      return true;
    });
  };

  const sportsVenues = filterVenues(
    VENUES.filter(v => v.serviceType === 'sports')
  ).filter(v => selectedSportsCategory === 'all' || v.category === selectedSportsCategory);

  const gamingVenues = filterVenues(
    VENUES.filter(v => v.serviceType === 'gaming')
  ).filter(v => selectedGamingCategory === 'all' || v.category === selectedGamingCategory);

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={q => {
          setSearchQuery(q);
          if (currentView !== 'home') setCurrentView('home');
        }}
        selectedServiceType={selectedServiceType}
        onSelectServiceType={type => {
          setSelectedServiceType(type);
          if (type === 'sports') scrollToSection('offline-sports');
          if (type === 'gaming') scrollToSection('online-gaming-centres');
        }}
        bookingsCount={bookings.filter(b => b.status === 'confirmed').length}
        onOpenMyBookings={handleGoToMyBookings}
      />

      <main className="flex-1">
        {/* VIEW 1: DEDICATED VENUE DETAILS PAGE WITH EMBEDDED BOOKING */}
        {currentView === 'venue-details' && selectedVenue && (
          <VenueDetailsPage
            venue={selectedVenue}
            onBack={handleGoHome}
            onBookingSuccess={handleBookingSuccess}
            onGoToMyBookings={handleGoToMyBookings}
          />
        )}

        {/* VIEW 2: DEDICATED MY BOOKINGS PAGE */}
        {currentView === 'my-bookings' && (
          <MyBookingsPage
            bookings={bookings}
            onBack={handleGoHome}
            onCancelBooking={handleCancelBooking}
            onExploreVenues={handleGoHome}
          />
        )}

        {/* VIEW 3: THE APPROVED HOMEPAGE (Preserved 100% intact) */}
        {currentView === 'home' && (
          <div>
            {/* Playo-Style Hero Section (Approved) */}
            <Hero
              onSelectService={setSelectedServiceType}
              selectedService={selectedServiceType}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onScrollToSection={scrollToSection}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-20">
              {/* ======================================================== */}
              {/* SECTION 1: EXPLORE OFFLINE SPORTS                        */}
              {/* ======================================================== */}
              {(selectedServiceType === 'all' || selectedServiceType === 'sports') && (
                <section id="offline-sports" className="scroll-mt-24">
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                        <Trophy size={14} />
                        <span>Real-World Physical Venues</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                        Explore Offline Sports
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Book cricket grounds, football turfs, badminton courts, basketball, tennis, and box cricket cages.
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      Showing <span className="text-emerald-600 font-bold">{sportsVenues.length}</span> sports venues
                    </div>
                  </div>

                  {/* Sports Category Filter Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                    {SPORTS_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedSportsCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          selectedSportsCategory === cat.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Sports Venues Grid */}
                  {sportsVenues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sportsVenues.map(venue => (
                        <VenueCard
                          key={venue.id}
                          venue={venue}
                          onViewDetails={handleSelectVenue}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <p className="text-slate-500 text-sm">No offline sports venues found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setSelectedSportsCategory('all');
                          setSearchQuery('');
                          setSelectedCity('all');
                        }}
                        className="mt-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
                      >
                        Reset Sports Filters
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* ======================================================== */}
              {/* SECTION 2: EXPLORE ONLINE GAMING CENTRES                 */}
              {/* ======================================================== */}
              {(selectedServiceType === 'all' || selectedServiceType === 'gaming') && (
                <section id="online-gaming-centres" className="scroll-mt-24">
                  {/* Section Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
                        <Gamepad2 size={14} />
                        <span>Physical Gaming-Centre Equipment & Lounges</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                        Explore Online Gaming Centres
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Reserve physical PC gaming stations (RTX 4090), private PlayStation 5 suites, Xbox stations, VR arenas, and sim racing cockpits.
                      </p>
                    </div>

                    <div className="text-xs font-semibold text-slate-500">
                      Showing <span className="text-brand-600 font-bold">{gamingVenues.length}</span> gaming centres
                    </div>
                  </div>

                  {/* Gaming Category Filter Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
                    {GAMING_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedGamingCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          selectedGamingCategory === cat.id
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Gaming Venues Grid */}
                  {gamingVenues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gamingVenues.map(venue => (
                        <VenueCard
                          key={venue.id}
                          venue={venue}
                          onViewDetails={handleSelectVenue}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <p className="text-slate-500 text-sm">No gaming centres found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setSelectedGamingCategory('all');
                          setSearchQuery('');
                          setSelectedCity('all');
                        }}
                        className="mt-3 px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-xs font-bold hover:bg-brand-100 transition"
                      >
                        Reset Gaming Filters
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Feature Highlights & Trust Pillars */}
            <FeaturesBanner />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
