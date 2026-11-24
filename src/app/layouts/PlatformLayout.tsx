import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  ShieldAlert,
  Building2,
  CreditCard,
  History,
  Settings,
  BarChart4,
  ArrowLeft,
  LogOut,
  Sliders,
  Menu,
  X,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export const PlatformLayout: React.FC = () => {
  const { profile, user, logout, isPlatformAdmin, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const activeEmail = profile?.email || user?.email || '';

  const navItems = [
    { label: 'Platform Overview', path: '/platform/dashboard', icon: BarChart4 },
    { label: 'Registered Businesses', path: '/platform/businesses', icon: Building2 },
    { label: 'Subscriptions', path: '/platform/subscriptions', icon: Sliders },
    { label: 'Transactions', path: '/platform/transactions', icon: CreditCard },
    { label: 'Platform Audit Logs', path: '/platform/audit-logs', icon: History },
    { label: 'Platform Settings', path: '/platform/settings', icon: Settings },
  ];

  const handleAdminSwitch = async () => {
    setIsSwitching(true);
    try {
      await login('owusujunior2004@gmail.com');
      navigate('/platform/dashboard');
    } catch (err) {
      console.error('Error switching to platform admin:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-700/50 flex items-center justify-center mx-auto text-red-500 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-[11px] font-mono mb-3">
              SECURITY LOCKOUT
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Platform Admin Restricted
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
              The SewDesk Platform Administration console is hard-locked exclusively to the authorized platform operator (<span className="text-white font-mono font-medium">owusujunior2004@gmail.com</span>).
            </p>
          </div>

          <div className="p-3.5 bg-black border border-neutral-800 rounded-lg text-xs text-neutral-300 text-left font-mono space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Access Attempt Audit</div>
            <div className="text-neutral-400 truncate">
              User: <span className="text-white">{activeEmail || 'Unauthenticated'}</span>
            </div>
            <div className="text-red-400 text-[11px]">
              Status: UNAUTHORIZED (Non-operator identity)
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            <Button
              variant="outline"
              className="bg-white text-black font-semibold hover:bg-neutral-100 border border-neutral-300 text-xs w-full sm:w-auto shadow-sm"
              onClick={() => navigate('/app/dashboard')}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-black" />
              Return to Workspace
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white text-xs w-full sm:w-auto font-semibold shadow-sm"
              disabled={isSwitching}
              onClick={handleAdminSwitch}
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              {isSwitching ? 'Authenticating...' : 'Sign In as Operator'}
            </Button>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500">
            SewDesk Platform Core &bull; Designed and built by <span className="text-neutral-300 font-medium">Dev_OJ</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      <ScrollToTop />

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-white text-base font-sans">
            SewDesk
          </span>
          <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono px-1.5 py-0">
            OPS
          </Badge>
          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/app/dashboard"
            className="text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800 flex items-center gap-1"
          >
            <span>Workspace</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-md border border-neutral-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-4/5 max-w-xs h-full bg-black border-r border-neutral-800 p-5 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-white text-lg font-sans">
                      SewDesk
                    </span>
                    <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono">
                      OPS
                    </Badge>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mt-0.5">
                    Platform Admin
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 mb-2 px-2 py-1.5 rounded bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-300 truncate">
                <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Root Operator</span>
                {activeEmail}
              </div>

              <nav className="mt-4 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              <Link
                to="/app/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors p-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Workspace</span>
              </Link>
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 p-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
              <div className="text-[10px] text-neutral-500 pt-2 text-center border-t border-neutral-900">
                Designed and built by <span className="text-neutral-300 font-semibold">Dev_OJ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Platform Operator Sidebar - fixed to screen even when scrolled down */}
      <aside className="hidden md:flex w-64 bg-black border-r border-neutral-800 flex-col shrink-0 fixed top-0 left-0 bottom-0 z-30 h-screen overflow-y-auto">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg font-sans">
                SewDesk
              </span>
              <Badge variant="default" className="bg-red-600 text-white text-[9px] font-mono">
                OPS
              </Badge>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono mt-0.5">
              Platform Admin
            </p>
          </div>
        </div>

        {/* Operator Badge */}
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800">
          <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">Active Operator</div>
          <div className="text-xs font-mono text-neutral-200 truncate font-semibold mt-0.5">
            {activeEmail}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white border border-neutral-700 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-3 bg-black">
          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tailor Workspace</span>
          </Link>
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate max-w-[150px] font-mono text-[11px] text-neutral-400">
              {activeEmail}
            </span>
            <button
              onClick={() => logout()}
              className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="pt-2 text-[10px] text-neutral-500 text-center border-t border-neutral-900">
            Designed and built by <span className="text-neutral-300 font-semibold">Dev_OJ</span>
          </div>
        </div>
      </aside>

      {/* Main Platform Content - offset by fixed desktop sidebar */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
