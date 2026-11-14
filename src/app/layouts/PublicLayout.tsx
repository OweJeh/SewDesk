import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Menu, X } from 'lucide-react';
import { ScrollToTop, BackToTopButton } from '@/components/common/ScrollToTop';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Top banner vanishes automatically after 1 minute (60,000 ms)
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      {/* Auto scroll-to-top on every page navigation */}
      <ScrollToTop />

      {/* Floating send-to-top button on scroll */}
      <BackToTopButton />

      {/* Top Banner (Vanishes after 1 min) */}
      {showBanner && (
        <div className="bg-[#111111] text-white py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 transition-all duration-500 print:hidden">
          <span>First 100 registered customers are 100% free for all tailoring studios.</span>
          <Link to="/register" className="underline font-semibold ml-1 hover:text-neutral-300">
            Claim workspace &rarr;
          </Link>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo — icon alone without wordmark on mobile, full wordmark on desktop */}
          <div className="shrink-0 flex items-center">
            <span className="sm:hidden">
              <Logo size="md" iconOnly />
            </span>
            <span className="hidden sm:inline-block">
              <Logo showTagline size="md" />
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-black ${
                  location.pathname === link.path ? 'text-black font-semibold' : 'text-[#777777]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <Link to="/app/dashboard">
                <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  <span className="hidden sm:inline">Open Workspace</span>
                  <span className="sm:hidden">Workspace</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-neutral-800">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="px-3 sm:px-4 text-xs sm:text-sm font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />}>
                    <span>Start Free</span>
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button for Navigation Links */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-neutral-600 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E5E5] bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-black text-white font-semibold'
                    : 'text-neutral-700 hover:bg-[#F5F5F5] hover:text-black'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page Content Slot */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Minimalist Footer */}
      <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] text-[#777777] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
              <Logo showTagline size="md" />
              <p className="text-xs text-[#777777] leading-relaxed">
                The modern, multi-tenant digital workspace engineered for bespoke tailors, seamstresses, and high-end fashion studios.
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Isolated Multi-Tenant Security</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/features" className="hover:text-black transition-colors">Interactive Measurement Picker</Link></li>
                <li><Link to="/features" className="hover:text-black transition-colors">Workshop & Production Pipeline</Link></li>
                <li><Link to="/features" className="hover:text-black transition-colors">Order & Fabric Tracking</Link></li>
                <li><Link to="/pricing" className="hover:text-black transition-colors">Simple Pricing & Free Tier</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Workspace</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-black transition-colors">Create Studio Account</Link></li>
                <li><Link to="/login" className="hover:text-black transition-colors">Studio Sign In</Link></li>
                <li><Link to="/about" className="hover:text-black transition-colors">About SewDesk</Link></li>
                <li><Link to="/platform/dashboard" className="hover:text-black transition-colors text-neutral-400">Platform Admin</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Trust & Standards</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
                <li className="flex items-center gap-1.5 text-neutral-500">
                  <Zap className="w-3.5 h-3.5 text-black" />
                  <span>Offline-Aware PWA Engine</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#777777]">
            <p>&copy; {new Date().getFullYear()} SewDesk Technologies. All rights reserved.</p>
            <p className="text-xs text-neutral-600 font-medium">
              Designed and built by <span className="font-semibold text-black">Dev_OJ</span>
            </p>
            <p className="mt-2 sm:mt-0 font-medium text-black tracking-wider text-[11px] uppercase">
              Measure. Manage. Create.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
