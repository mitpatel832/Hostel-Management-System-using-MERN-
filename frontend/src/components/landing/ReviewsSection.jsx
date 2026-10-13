import React from 'react';
import { Star } from 'lucide-react';

const reviewsList = [
  {
    quote:
      'Room allotment used to mean three registers and a queue. Now I assign beds in under a minute and see vacant beds by block instantly.',
    name: 'Prof. Ramesh Verma',
    role: 'Chief Hostel Warden',
    initials: 'RV',
    tone: 'bg-ledger-950 text-brass-400'
  },
  {
    quote:
      'I raised a washroom leak ticket after lab. It was marked resolved the same afternoon, and I could rate the fix from my phone.',
    name: 'Priya Patel',
    role: '2nd Year · Electronics · Block B',
    initials: 'PP',
    tone: 'bg-brass-500 text-ledger-950'
  },
  {
    quote:
      'As a parent, I finally get clarity — rent receipts, room details, and guardian contacts are all in one place. No more calling the office every month.',
    name: 'Sunita Sharma',
    role: 'Parent of Rahul Sharma · Block A',
    initials: 'SS',
    tone: 'bg-sage-600 text-white'
  }
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-20 bg-parchment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-brass-600 font-sans">
            Resident & Staff Reviews
          </span>
          <h2 className="text-3xl font-black font-display text-ink">
            What our campus community says
          </h2>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewsList.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-7 flex flex-col justify-between space-y-6 rounded-2xl border border-ledger-200/60 shadow-card"
            >
              <div className="space-y-4">
                <div className="flex text-brass-500 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brass-500" />
                  ))}
                </div>
                <p className="text-sm text-ledger-600 leading-relaxed font-sans">
                  “{t.quote}”
                </p>
              </div>

              <div className="pt-4 border-t border-ledger-100 flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 font-mono ${t.tone}`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-ink font-display">{t.name}</p>
                  <p className="text-[11px] text-ledger-500 font-sans">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
