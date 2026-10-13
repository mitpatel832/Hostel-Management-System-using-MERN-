import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqList = [
  {
    q: 'How does automated room allocation work?',
    a: 'Wardens can view vacant beds by block, floor, and room type (Single, Double, Triple). Assigning a student updates bed occupancy in real-time and automatically blocks overbooking.'
  },
  {
    q: 'Can students track maintenance requests live?',
    a: 'Yes. Each complaint ticket moves from Pending → In-Progress → Resolved. Students receive resolution notes from staff and can rate the fix (1–5 Stars) directly from their portal.'
  },
  {
    q: 'How do digital fee receipts and dues work?',
    a: 'Paid invoices generate an official digital receipt with a unique serial number (e.g. RCP-202503-8492) and transaction ID. Students can view and print receipts anytime.'
  },
  {
    q: 'Are emergency notices sent instantly?',
    a: 'Yes. Wardens can broadcast announcements to the whole campus, students only, or specific blocks. Urgent alerts can be pinned to the top of the notice board.'
  },
  {
    q: 'Can multiple wardens and administrators manage the system together?',
    a: 'Yes. HostelHive supports Role-Based Access Control (RBAC) with separate encrypted permissions for Chief Wardens, Floor Wardens, and Student Residents.'
  }
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-20 bg-parchment border-t border-ledger-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-brass-600 uppercase tracking-[0.15em] font-sans">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-display text-ink hero-title">
            Everything you need to know
          </h2>
          <p className="text-ledger-600 text-sm font-sans max-w-xl mx-auto leading-relaxed">
            Quick answers to common questions about room allocation, maintenance ticketing, and fee receipts.
          </p>
        </div>

        {/* Full Width Accordion */}
        <div className="space-y-3.5">
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-ledger-200/70 rounded-2xl overflow-hidden shadow-card hover:border-ledger-300 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-parchment/40 transition-colors"
                >
                  <span className="faq-question text-base font-semibold text-[#1A1F26] font-sans pr-4 leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-ledger-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brass-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-ledger-600 leading-relaxed font-sans border-t border-ledger-100 pt-3.5 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
