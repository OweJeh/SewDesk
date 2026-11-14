import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ScrollToTop, BackToTopButton } from '@/components/common/ScrollToTop';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showBanner, setShowBanner] = React.useState(true);

  React.useEffect(() => {
    // Top banner vanishes automatically after 1 minute (60,000 ms)
    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

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
        <div className="bg-[#111111] text-white py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2 transition-all duration-500">
          <span>First 100 registered customers are 100% free for all tailoring studios.</span>
          <Link to="/register" className="underline font-semibold ml-1 hover:text-neutral-300">
            Claim workspace &rarr;
          </Link>
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo showTagline size="md" />

          {/* Desktop Nav */}
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

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/app/dashboard">
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
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

          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777]">
            <p>&copy; {new Date().getFullYear()} SewDesk Technologies. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium text-black">
              MEASURE. MANAGE. CREATE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
