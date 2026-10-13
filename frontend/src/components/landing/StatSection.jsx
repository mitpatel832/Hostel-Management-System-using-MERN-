import React from 'react';

const statsData = [
  { value: '1,200+', label: 'Campus students managed', note: '100% Digital' },
  { value: '98.5%', label: 'Complaints resolved', note: 'Avg 4 hrs turnaround' },
  { value: '450', label: 'Beds across 3 blocks', note: 'Blocks A, B & C' },
  { value: '₹42L+', label: 'Digital fee collection', note: 'Zero cash handling' }
];

const StatsBand = () => {
  return (
    <section id="stats" className="py-14 bg-white border-y border-ledger-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-brass-600 uppercase tracking-[0.15em] font-sans">
            Trusted on campus
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-ink">
            Numbers that matter to wardens and parents
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="bg-parchment p-6 text-center space-y-1 rounded-2xl border border-ledger-200/60"
            >
              <p className="text-3xl sm:text-4xl font-black font-display text-brass-600 tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs font-bold text-ink font-sans">{stat.label}</p>
              <span className="inline-block text-[11px] text-sage-600 font-semibold pt-1 font-sans">
                {stat.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBand;
