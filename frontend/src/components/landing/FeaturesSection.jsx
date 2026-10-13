import React from 'react';
import {
  BedDouble,
  Wrench,
  Receipt,
  BellRing,
  ShieldCheck,
  Users2
} from 'lucide-react';

const featureList = [
  {
    icon: BedDouble,
    accent: 'bg-brass-50 text-brass-600 border-brass-200/60',
    title: 'Smart Room Allocation',
    description:
      'See vacant beds by block and floor in real time. Assign single, double, or triple rooms without overbooking.'
  },
  {
    icon: Wrench,
    accent: 'bg-sage-50 text-sage-600 border-sage-200/60',
    title: 'Maintenance Tickets',
    description:
      'Students report plumbing, electrical, or WiFi issues with priority tags — track each ticket until fully resolved and rated.'
  },
  {
    icon: Receipt,
    accent: 'bg-brass-50 text-brass-700 border-brass-200/60',
    title: 'Digital Invoices & Receipts',
    description:
      'Auto-generate monthly rent, apply late fines, and issue downloadable receipts with transaction IDs.'
  },
  {
    icon: BellRing,
    accent: 'bg-danger-light text-danger border-danger/20',
    title: 'Targeted Notice Board',
    description:
      'Broadcast emergencies, mess updates, or exam alerts to the whole hostel — or just one block or floor.'
  },
  {
    icon: ShieldCheck,
    accent: 'bg-ledger-100 text-ledger-700 border-ledger-200/60',
    title: 'Role-Based Access',
    description:
      'JWT-secured portals keep admin, warden, and student views strictly separated.'
  },
  {
    icon: Users2,
    accent: 'bg-sage-50 text-sage-700 border-sage-200/60',
    title: 'Roommate & Guardian Hub',
    description:
      'Room details, roommate contacts, and parent phone numbers stay linked to each resident profile.'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-brass-600 uppercase tracking-[0.15em] font-sans">
            What you get
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-ink tracking-tight">
            Everything the hostel office needs — without the paperwork
          </h2>
          <p className="text-ledger-600 text-sm sm:text-base leading-relaxed font-sans">
            Built for daily operations: allotment, repairs, rent, and announcements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 space-y-4 rounded-2xl border border-ledger-200/60 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center border ${f.accent} group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-ink group-hover:text-brass-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-ledger-500 leading-relaxed font-sans">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
