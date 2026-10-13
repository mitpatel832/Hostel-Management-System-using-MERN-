import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import HeroSection from '../components/landing/HeroSection';
import StatSection from '../components/landing/StatSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ReviewsSection from '../components/landing/ReviewsSection';
import FaqSection from '../components/landing/FaqSection';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-parchment flex flex-col selection:bg-brass-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero */}
        <HeroSection />
        {/* 2. Trust Stats Band */}
        <StatSection />
        {/* 3. Core Features */}
        <FeaturesSection />
        {/* 4. Resident & Staff Testimonials */}
        <ReviewsSection />
        {/* 5. Full Width FAQ Accordion */}
        <FaqSection />
        {/* 6. Dual Path Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
