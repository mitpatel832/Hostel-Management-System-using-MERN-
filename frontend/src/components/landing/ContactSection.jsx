import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all inquiry fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Inquiry sent successfully! The hostel office will respond shortly.');
    setFormData({ name: '', email: '', role: 'student', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-white border-t border-ledger-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-brass-600 uppercase tracking-[0.15em] font-sans">
            Get In Touch
          </span>
          <h2 className="text-3xl sm:text-4xl font-black font-display text-ink">
            Hostel Helpdesk & Office Contact
          </h2>
          <p className="text-ledger-600 text-sm font-sans">
            Reach out to our campus residence office or send a direct message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT: Practical Hostel Office Info */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Campus Office Hours Card */}
            <div className="bg-ledger-950 text-parchment p-7 rounded-2xl border border-ledger-800 shadow-ledger space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brass-500/20 text-brass-400 border border-brass-500/30 text-[11px] font-bold uppercase tracking-wider font-sans">
                  <Building2 className="h-3.5 w-3.5" /> Hostel Administrative Office
                </span>
                <span className="text-[10px] font-mono text-sage-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Mon–Sat: 8 AM – 8 PM
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-parchment">
                Chief Warden & Administration Desk
              </h3>

              <p className="text-xs text-ledger-400 leading-relaxed font-sans">
                For urgent room allocations, leave approvals, or emergency maintenance support, visit the reception desk or use the direct contacts below.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3 font-sans">
              <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60 flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-brass-50 text-brass-700 border border-brass-200/60 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Office Email</p>
                  <a href="mailto:support@hostelhive.in" className="text-xs font-mono text-brass-700 hover:underline">
                    support@hostelhive.in
                  </a>
                  <p className="text-[11px] text-ledger-500 mt-0.5">Average response time &lt; 2 hours</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60 flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-sage-50 text-sage-700 border border-sage-200/60 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Warden Emergency Helpline</p>
                  <a href="tel:+919876543210" className="text-xs font-mono text-sage-700 hover:underline">
                    +91 98765 43210
                  </a>
                  <p className="text-[11px] text-ledger-500 mt-0.5">24/7 On-Call Campus Warden</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-parchment border border-ledger-200/60 flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-ledger-100 text-ledger-700 border border-ledger-200/60 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Office Location</p>
                  <p className="text-xs text-ledger-600 font-sans">
                    Block A Reception, Ground Floor, Central Campus
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Inquiry Form */}
          <div className="lg:col-span-6">
            <div className="bg-parchment p-8 rounded-2xl border border-ledger-200/70 space-y-5 shadow-card">
              <div>
                <span className="text-[11px] font-bold text-brass-600 uppercase tracking-wider font-sans">
                  Quick Message
                </span>
                <h3 className="text-xl font-bold font-display text-ink mt-0.5">
                  Send a note to the hostel office
                </h3>
                <p className="text-xs text-ledger-500 mt-1 font-sans">
                  For room queries, fee clarification, or general help.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-xl bg-sage-50 border border-sage-200 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-sage-600 mx-auto" />
                  <p className="text-sm font-bold text-sage-800 font-display">Message Received!</p>
                  <p className="text-xs text-sage-700 font-sans">
                    The office will reply shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary text-xs py-2 px-4 mt-1"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field font-sans"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="input-field font-sans"
                        placeholder="you@college.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">
                      I am inquiring as
                    </label>
                    <div className="grid grid-cols-2 gap-2 font-sans text-xs">
                      {[
                        { id: 'student', label: 'Student Resident' },
                        { id: 'parent', label: 'Parent / Guardian' }
                      ].map(({ id, label }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: id })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            formData.role === id
                              ? 'bg-brass-50 border-brass-500 text-brass-800'
                              : 'bg-white border-ledger-200 text-ledger-600 hover:bg-parchment'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ledger-700 mb-1 font-sans">
                      Message / Question *
                    </label>
                    <textarea
                      rows={3}
                      required
                      className="input-field resize-none font-sans text-xs"
                      placeholder="Type your question or query here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full text-xs py-3 font-bold">
                    Send to Hostel Desk
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;
