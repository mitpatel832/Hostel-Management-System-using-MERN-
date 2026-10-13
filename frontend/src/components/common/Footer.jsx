import React from 'react';
import { KeyRound } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#243B34] text-[#EFE8DA] border-t border-[#2F5D50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs text-[#EFE8DA]/80">
          
          {/* Left: Brand & Copyright */}
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#F2B134] flex items-center justify-center text-[#243B34] shadow-sm">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <span className="font-display font-normal text-base text-[#FAF6EF]">HostelHive</span>
            <span className="font-medium text-xs text-[#D9E4DE]">© 2026 HostelHive. All rights reserved.</span>
          </div>

          {/* Right: Product links with Amber #F2B134 hover accent */}
          <div className="flex items-center gap-6 font-semibold">
            <a href="#features" className="hover:text-[#F2B134] transition-colors font-sans">Features</a>
            <a href="#stats" className="hover:text-[#F2B134] transition-colors font-sans">Campus Stats</a>
            <a href="#faq" className="hover:text-[#F2B134] transition-colors font-sans">Contact</a>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
