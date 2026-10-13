import React from 'react';
import { LayoutDashboard, Bed, CheckCircle2 } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#2F5D50] text-[#FAF6EF]">
      {/* Decorative ambient backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FAF6EF]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F2B134]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* LEFT: Copy */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">

            {/* Heading: DM Serif Display regular weight 400 */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-display font-normal text-[#FAF6EF] tracking-tight leading-[1.08]">
              Run the hostel without the register book.
            </h1>

            {/* Subtext: DM Sans */}
            <p className="text-base sm:text-lg text-[#D9E4DE] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal mb-8">
              Save 10+ hours a week on manual tracking. One place for wardens and students to handle rooms, rent, and repairs — without paper, chasing, or cash counters.
            </p>

            {/* Outcome Stats: DM Serif Display for Stat Numbers */}
            <div className="pt-8 border-t border-[#D9E4DE]/20 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl sm:text-3xl font-display font-normal text-[#FAF6EF]">96%</p>
                <p className="text-xs font-semibold text-[#D9E4DE] font-sans mt-0.5">Occupancy tracked live</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-normal text-[#FAF6EF]">2 hrs</p>
                <p className="text-xs font-semibold text-[#D9E4DE] font-sans mt-0.5">Avg. resolution time</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-display font-normal text-[#F2B134]">Zero</p>
                <p className="text-xs font-semibold text-[#D9E4DE] font-sans mt-0.5">Cash handling needed</p>
              </div>
            </div>
          </div>

          {/* RIGHT: High-contrast card mockup */}
          <div className="lg:col-span-6 relative">
            <div className="absolute inset-0 bg-[#F2B134]/15 rounded-3xl transform rotate-1 scale-95 blur-xl pointer-events-none" />

            <div className="relative bg-white text-[#2B2622] rounded-2xl border border-[#E6DCCD] shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6DCCD] bg-[#FAF6EF]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#9A3B2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F2B134]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#1F6B4A]" />
                  <span className="text-[11px] font-mono text-[#6B6258] ml-2">hostelhive.local/admin</span>
                </div>
                <span className="badge-available text-[10px]">
                  Live System
                </span>
              </div>

              {/* Console preview */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-[#2F5D50] text-[#FAF6EF] flex items-center justify-center">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-display font-normal text-[#2B2622]">Master Console</p>
                      <p className="text-[11px] text-[#6B6258] font-sans">Block occupancy · live monitoring</p>
                    </div>
                  </div>
                  <span className="badge-pending text-[10px]">Session 2025–26</span>
                </div>

                {/* Mini KPI row */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E6DCCD]">
                    <p className="text-[10px] text-[#6B6258] font-bold font-sans uppercase">Residents</p>
                    <p className="text-base font-display font-normal text-[#2B2622]">1,200+</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E6DCCD]">
                    <p className="text-[10px] text-[#6B6258] font-bold font-sans uppercase">Occupancy</p>
                    <p className="text-base font-display font-normal text-[#2F5D50]">96%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF6EF] border border-[#E6DCCD]">
                    <p className="text-[10px] text-[#6B6258] font-bold font-sans uppercase">Open tickets</p>
                    <p className="text-base font-display font-normal text-[#E07A3F]">12</p>
                  </div>
                </div>

                {/* Supporting room detail card with IBM Plex Mono for Room code */}
                <div className="p-3.5 rounded-xl bg-[#FAF6EF] border border-[#E6DCCD] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#DDEFE5] text-[#1F6B4A]">
                      <Bed className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-normal text-[#2B2622]">Room A-101</p>
                      <p className="data-mono text-[10px]">Block A · Double Sharing · 2/2 beds</p>
                    </div>
                  </div>
                  <span className="badge-available text-[10px]">Occupied</span>
                </div>

                {/* Proof badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="badge-available text-[10px]">
                    <CheckCircle2 className="h-3 w-3" /> Tap fixed in 2 hrs
                  </span>
                  <span className="badge-pending text-[10px] font-mono">
                    RCP-202601 · ₹6,500 recorded
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
