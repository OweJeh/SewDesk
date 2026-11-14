import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { getRoleBadgeLabel } from '@/lib/permissions/rbac';
import {
  LayoutDashboard,
  Users,
  Ruler,
  Scissors,
  CreditCard,
  UserCheck,
  BarChart3,
  Sparkles,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  ShieldAlert,
  Wifi,
  WifiOff,
  Menu,
  X,
  Layers,
  Calculator,
  Camera,
  Tag,
  DollarSign,
  Share2,
} from 'lucide-react';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ProUpgradeModal } from '@/components/common/ProUpgradeModal';

export const AppLayout: React.FC = () => {
  const { profile, logout, isPlatformAdmin, setDemoPlatformAdmin } = useAuth();
  const { currentBusiness, currentRole, userBusinesses, switchBusiness, hasActiveSubscription } = useCurrentBusiness();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [proModalFeature, setProModalFeature] = useState<{ name: string; path: string; desc?: string } | null>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/app/customers', icon: Users },
    { label: 'Measurements', path: '/app/measurements', icon: Ruler },
    { label: 'Orders', path: '/app/orders', icon: Scissors },
    { label: 'Payments', path: '/app/payments', icon: CreditCard },
    { label: 'Staff', path: '/app/staff', icon: UserCheck },
    { label: 'Reports', path: '/app/reports', icon: BarChart3 },
    { label: 'Subscription', path: '/app/subscription', icon: Sparkles },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const toolItems = [
    {
      label: 'Fabric Estimator',
      path: '/app/calculator',
      icon: Calculator,
      pro: true,
      desc: 'Calculate exact fabric yardage needed from garment style, client height, and fabric width.',
    },
    {
      label: 'Photo Vault',
      path: '/app/photos',
      icon: Camera,
      pro: true,
      desc: 'Capture fabric swatches and client posture photos to cut armholes and shoulders with precision.',
    },
    {
      label: 'Garment Bag Tags',
      path: '/app/garment-tag',
      icon: Tag,
      pro: true,
      desc: 'Print atelier hanger slips with QR codes linked directly to customer measurements.',
    },
    {
      label: 'Commission Payroll',
      path: '/app/commissions',
      icon: DollarSign,
      pro: true,
      desc: 'Track piece-rate workshop earnings and payouts for cutters and tailors per completed outfit.',
    },
    {
      label: 'Measurement Cards',
      path: '/app/measurement-card',
      icon: Share2,
      pro: true,
      desc: 'Share branded digital measurement cards with traveling clients to purchase fabric abroad.',
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const slotsUsed = currentBusiness?.customer_slots_used ?? 0;
  const isNearLimit = slotsUsed >= 80;
  const isAtLimit = slotsUsed >= 100;

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row text-[#111111] print:bg-white print:min-h-0">
      {/* Auto scroll-to-top on navigation */}
      <ScrollToTop />

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5E5E5] shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto print:hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5E5E5]">
          <Logo showTagline size="sm" to="/app/dashboard" />
        </div>

        {/* Business Selector Pill */}
        <div className="p-3 border-b border-[#E5E5E5] relative">
          <button
            onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors text-left"
          >
            <div className="truncate pr-2">
              <span className="block text-xs font-semibold text-black truncate">
                {currentBusiness?.business_name || 'My Studio'}
              </span>
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                {currentRole ? getRoleBadgeLabel(currentRole) : 'Member'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
          </button>

          {/* Business Dropdown */}
          {isBusinessDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-xl z-50 p-1.5 animate-in fade-in duration-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 py-1">
                Your Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {userBusinesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      switchBusiness(b.id);
                      setIsBusinessDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                      b.id === currentBusiness?.id
                        ? 'bg-black text-white font-medium'
                        : 'text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="truncate">{b.business_name}</span>
                    {b.id === currentBusiness?.id && (
                      <span className="text-[10px] uppercase font-bold shrink-0 ml-1">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-1 mt-1 border-t border-[#E5E5E5]">
                <button
                  onClick={() => {
                    setIsBusinessDropdownOpen(false);
                    navigate('/onboarding');
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-[#F5F5F5] hover:text-black'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Workshop Tools
          </div>
          {toolItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            const isDimmed = !hasActiveSubscription && item.pro;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => {
                  if (isDimmed) {
                    e.preventDefault();
                    setProModalFeature({ name: item.label, path: item.path, desc: item.desc });
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : isDimmed
                    ? 'text-neutral-500 opacity-60 hover:opacity-100 hover:bg-[#F5F5F5] hover:text-black'
                    : 'text-neutral-700 hover:bg-[#F5F5F5] hover:text-black'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : isDimmed ? 'text-neutral-400' : 'text-neutral-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.pro && (
                  <span
                    className={`ml-auto text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                      hasActiveSubscription
                        ? 'bg-neutral-100 text-neutral-700'
                        : 'bg-black text-white'
                    }`}
                  >
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Customer Allowance Progress Box */}
        <div className="p-3 mx-3 mb-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-black">Customer Allowance</span>
            <span className="font-mono text-[11px] text-[#777777]">{slotsUsed} / 100</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-black'
              }`}
              style={{ width: `${Math.min(100, (slotsUsed / 100) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#777777] mt-1.5">
            {isAtLimit
              ? 'Limit reached. Upgrade required for next customer.'
              : isNearLimit
              ? 'Approaching 100 free customer limit.'
              : '100 free customer records included.'}
          </p>
        </div>

        {/* Footer Profile Strip */}
        <div className="p-3 border-t border-[#E5E5E5] bg-white flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="block text-xs font-semibold text-black truncate">
              {profile?.full_name || 'Staff User'}
            </span>
            <span className="block text-[10px] text-[#777777] truncate">
              {profile?.email || 'user@sewdesk.com'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-neutral-400 hover:text-black rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E5E5] h-16 flex items-center justify-between px-4 sm:px-6 print:hidden">
          {/* Left: Mobile Toggle & Workspace Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-neutral-700 hover:text-black"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-black truncate">
                {currentBusiness?.business_name || 'SewDesk Workspace'}
              </span>
              {currentRole && (
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-semibold">
                  {getRoleBadgeLabel(currentRole)}
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Network, Allowance, Notifications, Profile */}
          <div className="flex items-center gap-3">
            {/* Connectivity Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-green-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline Sync Ready</span>
                </>
              )}
            </div>

            {/* Notification Bell */}
            <Link
              to="/app/notifications"
              className="relative p-2 text-neutral-600 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-4 py-2 border-b border-[#E5E5E5]">
                    <p className="font-semibold text-black truncate">{profile?.full_name}</p>
                    <p className="text-[11px] text-[#777777] truncate">{profile?.email}</p>
                    <p className="text-[10px] font-mono uppercase text-neutral-400 mt-1">
                      Role: {currentRole ? getRoleBadgeLabel(currentRole) : 'Member'}
                    </p>
                  </div>

                  <Link
                    to="/app/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100"
                  >
                    Studio Settings
                  </Link>

                  <Link
                    to="/app/subscription"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100"
                  >
                    Subscription & Allowance
                  </Link>

                  {/* Platform Admin Switcher / Access */}
                  <div className="border-t border-[#E5E5E5] my-1 pt-1">
                    <Link
                      to="/platform/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-neutral-900 font-semibold hover:bg-neutral-100 flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-black" />
                      <span>Platform Admin</span>
                      {isPlatformAdmin ? (
                        <span className="ml-auto text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-mono">
                          ADMIN
                        </span>
                      ) : (
                        <span className="ml-auto text-[9px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                          LOCKED
                        </span>
                      )}
                    </Link>

                    {/* Developer toggle for test environment */}
                    <button
                      onClick={() => {
                        setDemoPlatformAdmin(!isPlatformAdmin);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-[10px] text-neutral-500 hover:bg-neutral-100"
                    >
                      {isPlatformAdmin ? '• Disable Admin Test Mode' : '• Enable Admin Test Mode'}
                    </button>
                  </div>

                  <div className="border-t border-[#E5E5E5] mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E5E5E5] px-4 py-3 space-y-1 print:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium ${
                    isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Workshop Tools
            </div>
            {toolItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              const isDimmed = !hasActiveSubscription && item.pro;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (isDimmed) {
                      e.preventDefault();
                      setProModalFeature({ name: item.label, path: item.path, desc: item.desc });
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium ${
                    isActive
                      ? 'bg-black text-white'
                      : isDimmed
                      ? 'text-neutral-500 opacity-60 hover:opacity-100 hover:bg-neutral-100'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.pro && (
                    <span
                      className={`ml-auto text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                        hasActiveSubscription
                          ? 'bg-neutral-100 text-neutral-700'
                          : 'bg-black text-white'
                      }`}
                    >
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Workspace Content Slot */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb Friendly, 48px touch targets) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] flex items-center justify-around h-16 px-2 shadow-lg print:hidden">
          <Link
            to="/app/dashboard"
            className={`flex flex-col items-center justify-center min-w-[56px] h-full ${
              location.pathname === '/app/dashboard' ? 'text-black font-semibold' : 'text-neutral-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1">Home</span>
          </Link>
          <Link
            to="/app/customers"
            className={`flex flex-col items-center justify-center min-w-[56px] h-full ${
              location.pathname.startsWith('/app/customers') ? 'text-black font-semibold' : 'text-neutral-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1">Customers</span>
          </Link>
          <Link
            to="/app/orders"
            className={`flex flex-col items-center justify-center min-w-[56px] h-full ${
              location.pathname.startsWith('/app/orders') ? 'text-black font-semibold' : 'text-neutral-500'
            }`}
          >
            <Scissors className="w-5 h-5" />
            <span className="text-[10px] mt-1">Orders</span>
          </Link>
          <Link
            to="/app/measurements"
            className={`flex flex-col items-center justify-center min-w-[56px] h-full ${
              location.pathname.startsWith('/app/measurements') ? 'text-black font-semibold' : 'text-neutral-500'
            }`}
          >
            <Ruler className="w-5 h-5" />
            <span className="text-[10px] mt-1">Ruler</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex flex-col items-center justify-center min-w-[56px] h-full text-neutral-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </nav>
      </div>

      {/* Pro Feature Upgrade Popup */}
      <ProUpgradeModal
        isOpen={Boolean(proModalFeature)}
        onClose={() => setProModalFeature(null)}
        featureName={proModalFeature?.name}
        featureDescription={proModalFeature?.desc}
        onContinueAnyway={
          proModalFeature
            ? () => {
                navigate(proModalFeature.path);
                setProModalFeature(null);
              }
            : undefined
        }
      />
    </div>
  );
};

