import React from 'react';
import { ShieldCheck, Zap, Users, Award } from 'lucide-react';

export const FeaturesBanner: React.FC = () => {
  const features = [
    {
      icon: <Zap size={22} className="text-amber-500" />,
      title: 'Real-Time Slot Booking',
      desc: 'Browse live court and station availability. Lock your favorite hours in under 30 seconds with instant confirmation.',
    },
    {
      icon: <ShieldCheck size={22} className="text-brand-600" />,
      title: '100% Verified Quality',
      desc: 'Every turf is inspected for shock-absorption, turf grading, and lighting; every gaming center is verified for 240Hz+ monitors and top-tier GPUs.',
    },
    {
      icon: <Users size={22} className="text-emerald-500" />,
      title: 'Split Bill With Your Squad',
      desc: 'Playing football with 10 teammates or a 5v5 Valorant LAN? Share a booking link and split payment automatically.',
    },
    {
      icon: <Award size={22} className="text-blue-500" />,
      title: 'Best Price & Rewards',
      desc: 'Guaranteed best hourly rates with zero hidden surge fees, plus reward points redeemable across sports and gaming venues.',
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
            The GameHub Advantage
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Built for Athletes, Squads & Gamers
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Whether sweating on the turf or clutching in the esports lounge, GameHub powers your session effortlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-300 transition-colors shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-4 shadow-xs">
                {f.icon}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5 font-display">
                {f.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
