import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'Campus Stats', href: '#stats' },
  { name: 'Reviews', href: '#reviews' },
  { name: 'FAQ', href: '#faq' }
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sliding Nav Indicator State
  const [activeTab, setActiveTab] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navContainerRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update sliding indicator position
  const updateIndicator = (element) => {
    if (!element || !navContainerRef.current) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const containerRect = navContainerRef.current.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();

    setIndicatorStyle({
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
      opacity: 1
    });
  };

  const handleMouseEnter = (index) => {
    updateIndicator(itemRefs.current[index]);
  };

  const handleMouseLeave = () => {
    if (activeTab !== null && itemRefs.current[activeTab]) {
      updateIndicator(itemRefs.current[activeTab]);
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  const handleLinkClick = (index) => {
    setActiveTab(index);
    updateIndicator(itemRefs.current[index]);
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    return user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF6EF]/95 backdrop-blur-md border-b border-[#E6DCCD] shadow-sm py-3.5'
          : 'bg-[#FAF6EF] py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-[#2F5D50] flex items-center justify-center text-[#FAF6EF] shadow-sm group-hover:scale-105 transition-transform duration-200">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-normal text-2xl text-[#2B2622] tracking-tight leading-none">
                Hostel<span className="text-[#E07A3F]">Hive</span>
              </span>
              <span className="text-[10px] font-bold text-[#6B6258] tracking-[0.15em] uppercase font-sans mt-0.5">
                Smart Campus Living
              </span>
            </div>
          </Link>

          {/* Desktop Nav with Terracotta Active Underline */}
          <div
            ref={navContainerRef}
            onMouseLeave={handleMouseLeave}
            className="relative hidden md:flex items-center gap-8 py-1 text-sm font-semibold text-[#2B2622] font-sans"
          >
            {navItems.map((item, idx) => (
              <a
                key={idx}
                ref={(el) => (itemRefs.current[idx] = el)}
                href={item.href}
                onMouseEnter={() => handleMouseEnter(idx)}
                onClick={() => handleLinkClick(idx)}
                className={`py-1.5 transition-colors duration-200 ${
                  activeTab === idx ? 'text-[#E07A3F] font-bold' : 'hover:text-[#E07A3F]'
                }`}
              >
                {item.name}
              </a>
            ))}

            {/* Active Link Underline (#E07A3F) */}
            <div
              className="absolute -bottom-1 h-[2.5px] bg-[#E07A3F] rounded-full transition-all duration-300 ease-out pointer-events-none shadow-[0_0_8px_rgba(224,122,63,0.4)]"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity
              }}
            />
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-[#6B6258] hover:text-[#9A3B2E] hover:bg-[#F6DFDA] transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-[#2B2622] hover:text-[#E07A3F] px-3 py-2 transition-colors font-sans"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-2.5 px-4"
                >
                  Register <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#2B2622] hover:text-[#E07A3F] hover:bg-[#E6DCCD]/40 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6EF] border-b border-[#E6DCCD] px-4 pt-3 pb-6 space-y-4 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-bold text-[#2B2622] font-sans">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => handleLinkClick(idx)}
                className="px-3 py-2 rounded-lg hover:bg-[#E6DCCD]/40 hover:text-[#E07A3F]"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#E6DCCD] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-xs py-2.5 text-center">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-xs py-2.5 text-center">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-xs py-2.5 text-center">
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
