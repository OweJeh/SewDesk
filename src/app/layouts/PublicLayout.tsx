import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { ThreadWord } from '@/components/ui/thread-text';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-[#0A0A0A] text-white py-2 px-4 text-center text-xs font-medium border-b border-neutral-800 flex items-center justify-center gap-2 select-none">
        <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
        <span className="text-neutral-300">
          <ThreadWord className="text-[1.35em] text-white mr-1">First</ThreadWord>
          100 registered clients are 100% free for all tailoring studios.
        </span>
        <Link to="/register" className="text-white underline font-semibold ml-1 hover:text-neutral-200 transition-colors">
          Claim workspace &rarr;
        </Link>
      </div>

      {/* Main Navigation Header with Frosted Glass */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo showTagline size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-black relative py-1 ${
                    isActive ? 'text-black font-semibold' : 'text-[#777777]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/app/dashboard">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  <ThreadWord className="text-[1.25em] text-white mr-1 font-normal">Open</ThreadWord>
                  Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-neutral-700 hover:text-black">
                    <ThreadWord className="text-[1.25em] text-black mr-1 font-normal">Sign</ThreadWord>
                    In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-black text-white hover:bg-neutral-800" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    <ThreadWord className="text-[1.25em] text-white mr-1 font-normal">Start</ThreadWord>
                    Free
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

      {/* Luxury Atelier Footer */}
      <footer className="border-t border-[#E5E5E5] bg-[#FAFAFA] text-[#777777] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
              <Logo showTagline size="md" />
              <p className="text-xs text-[#777777] leading-relaxed pt-2">
                <ThreadWord className="text-[1.28em] text-black mr-1">The</ThreadWord>
                modern digital workspace engineered for bespoke tailors, seamstresses, and high-end fashion studios.
              </p>
              <div className="flex items-center gap-2 text-xs text-neutral-600 pt-1">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>PostgreSQL Multi-Tenant RLS Privacy</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                <ThreadWord className="text-[1.3em] text-black mr-1 font-normal">Product</ThreadWord>
                Features
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/features" className="hover:text-black transition-colors">Interactive Touch Ruler</Link></li>
                <li><Link to="/features" className="hover:text-black transition-colors">Workshop Production Pipeline</Link></li>
                <li><Link to="/features" className="hover:text-black transition-colors">Permanent Measurement Book</Link></li>
                <li><Link to="/pricing" className="hover:text-black transition-colors">Simple Pricing & Free Tier</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                <ThreadWord className="text-[1.3em] text-black mr-1 font-normal">Workspace</ThreadWord>
                Access
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/register" className="hover:text-black transition-colors">Create Studio Account</Link></li>
                <li><Link to="/login" className="hover:text-black transition-colors">Studio Sign In</Link></li>
                <li><Link to="/about" className="hover:text-black transition-colors">About SewDesk</Link></li>
                <li><Link to="/platform/dashboard" className="hover:text-black transition-colors text-neutral-400">Platform Administration</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                <ThreadWord className="text-[1.3em] text-black mr-1 font-normal">Trust</ThreadWord>
                & Standards
              </h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
                <li className="flex items-center gap-1.5 text-neutral-600">
                  <Zap className="w-3.5 h-3.5 text-black" />
                  <span>Offline-Aware PWA Engine</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777]">
            <p>&copy; {new Date().getFullYear()} SewDesk Technologies. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 font-medium text-black tracking-wider">
              <span className="font-thread text-[1.4em] text-black mr-1 align-middle">Measure.</span>
              MANAGE. CREATE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
