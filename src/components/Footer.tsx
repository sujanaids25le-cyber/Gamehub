import React from 'react';
import { Mail, Phone, MapPin, Globe, MessageSquare, Shield, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-blue flex items-center justify-center text-white font-extrabold text-lg">
                GH
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-display">
                GAME<span className="text-brand-400">HUB</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              India's all-in-one sports turf and physical gaming-centre booking ecosystem. Discover cricket grounds, football turfs, badminton courts, RTX 4090 PC stations, PS5 lounges, and VR centres.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg">
                <Globe size={14} className="text-brand-400" />
                <span>Pan-India Network</span>
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg">
                <Shield size={14} className="text-emerald-400" />
                <span>Verified Facilities</span>
              </span>
            </div>
          </div>

          {/* Offline Sports */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Offline Sports</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#offline-sports" className="hover:text-white transition">Cricket Grounds</a></li>
              <li><a href="#offline-sports" className="hover:text-white transition">Football Turfs</a></li>
              <li><a href="#offline-sports" className="hover:text-white transition">Badminton Courts</a></li>
              <li><a href="#offline-sports" className="hover:text-white transition">Basketball Courts</a></li>
              <li><a href="#offline-sports" className="hover:text-white transition">Tennis Courts</a></li>
              <li><a href="#offline-sports" className="hover:text-white transition">Box Cricket Arenas</a></li>
            </ul>
          </div>

          {/* Online Gaming Centres */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Gaming Centres</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#online-gaming-centres" className="hover:text-white transition">PC Gaming Stations</a></li>
              <li><a href="#online-gaming-centres" className="hover:text-white transition">PlayStation 5 Rooms</a></li>
              <li><a href="#online-gaming-centres" className="hover:text-white transition">Xbox Series X Hubs</a></li>
              <li><a href="#online-gaming-centres" className="hover:text-white transition">VR Gaming Centres</a></li>
              <li><a href="#online-gaming-centres" className="hover:text-white transition">Esports LAN Arenas</a></li>
              <li><a href="#online-gaming-centres" className="hover:text-white transition">Sim Racing Studios</a></li>
            </ul>
          </div>

          {/* Cities & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Top Cities</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">Bengaluru</a></li>
              <li><a href="#" className="hover:text-white transition">Mumbai</a></li>
              <li><a href="#" className="hover:text-white transition">Delhi NCR</a></li>
              <li><a href="#" className="hover:text-white transition">Hyderabad</a></li>
              <li><a href="#" className="hover:text-white transition">Pune</a></li>
              <li className="pt-2"><a href="#" className="text-brand-400 hover:underline font-semibold">List Your Facility →</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} GameHub Technologies Inc. Sports and Gaming Venue Platform.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Cancellation Policy</a>
            <a href="#" className="hover:text-slate-400">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
