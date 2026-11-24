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
  const { profile, logout, isPlatformAdmin } = useAuth();
  const {
    currentBusiness,
    currentRole,
    userBusinesses,
    switchBusiness,
    hasActiveSubscription,
    canCreateWorkspace,
    accessState,
  } = useCurrentBusiness();
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
    { label: 'Subscription', path: '/app/subscription', icon: CreditCard },
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

      {/* Sidebar for Desktop - fixed on side pane so it shows even when scrolled down */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#E5E5E5] shrink-0 fixed top-0 left-0 bottom-0 z-30 h-screen overflow-y-auto print:hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-[#E5E5E5]">
          <Logo showTagline size="sm" to="/app/dashboard" />
        </div>

        {/* Business Selector Pill */}
        <div className="p-3 border-b border-[#E5E5E5] relative">
          <button
            onClick={() => {
              if (userBusinesses.length > 1) {
                setIsBusinessDropdownOpen(!isBusinessDropdownOpen);
              }
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] transition-colors text-left ${
              userBusinesses.length > 1 ? 'hover:bg-[#F5F5F5] cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="truncate pr-2">
              <span className="block text-xs font-semibold text-black truncate">
                {currentBusiness?.business_name || 'My Studio'}
              </span>
              <span className="block text-[10px] text-[#777777] uppercase tracking-wider">
                {currentRole ? getRoleBadgeLabel(currentRole) : 'Owner'}
              </span>
            </div>
            {userBusinesses.length > 1 && (
              <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
            )}
          </button>

          {/* Business Dropdown (only when user has multiple memberships) */}
          {isBusinessDropdownOpen && userBusinesses.length > 1 && (
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
              <div className="pt-1 mt-1 border-t border-[#E5E5E5] px-2 py-1 text-[10px] text-neutral-400 text-center">
                1 workspace per account
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

        {/* Customer Allowance Progress Box - dynamic live from platform admin config */}
        <div className="p-3 mx-3 mb-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-black">Customer Allowance</span>
            <span className="font-mono text-[11px] text-[#777777]">
              {accessState.hasActiveSubscription
                ? `${accessState.slotsUsed} (Unlimited)`
                : `${accessState.slotsUsed} / ${accessState.maxSlots}`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                accessState.hasActiveSubscription
                  ? 'bg-black'
                  : accessState.isAtCustomerLimit
                  ? 'bg-red-600'
                  : accessState.isNearCustomerLimit
                  ? 'bg-amber-500'
                  : 'bg-black'
              }`}
              style={{
                width: accessState.hasActiveSubscription
                  ? '100%'
                  : `${Math.min(100, (accessState.slotsUsed / Math.max(1, accessState.maxSlots)) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-[#777777] leading-relaxed">
            {accessState.hasActiveSubscription
              ? `Unlimited capacity on ${accessState.tierName}.`
              : accessState.isAtCustomerLimit
              ? `Trial limit of ${accessState.maxSlots} reached. Upgrade required.`
              : accessState.isNearCustomerLimit
              ? `Approaching ${accessState.maxSlots} customer trial limit.`
              : `${accessState.maxSlots} free customer records included.`}
          </p>
          {!accessState.hasActiveSubscription && (
            <Link
              to="/app/subscription"
              className="text-[10px] font-semibold text-black underline hover:text-neutral-700 block pt-0.5"
            >
              Upgrade Plan &rarr;
            </Link>
          )}
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
        <div className="px-3 py-2 bg-[#FAFAFA] border-t border-[#E5E5E5] text-[10px] text-neutral-400 text-center">
          Designed and built by <span className="font-semibold text-neutral-700">Dev_OJ</span>
        </div>
      </aside>

      {/* Main Content Area - padded left by w-64 to accommodate fixed desktop sidebar */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
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

                  {/* Platform Admin Switcher (visible only to authorized platform admin) */}
                  {isPlatformAdmin && (
                    <div className="border-t border-[#E5E5E5] my-1 pt-1">
                      <Link
                        to="/platform/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-neutral-900 font-semibold hover:bg-neutral-100 flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-black" />
                        <span>Platform Admin</span>
                        <span className="ml-auto text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-mono">
                          ADMIN
                        </span>
                      </Link>
                    </div>
                  )}

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

        {/* Mobile Navigation Drawer - fixed overlay so it stays on screen at any scroll position */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex animate-in fade-in duration-150 print:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-4/5 max-w-xs h-full bg-white border-r border-[#E5E5E5] p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E5E5E5]">
                  <Logo showTagline size="sm" to="/app/dashboard" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Workshop Tools
                </div>
                <div className="space-y-1">
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
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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
              </div>

              {/* Drawer Bottom Allowance & Profile */}
              <div className="pt-3 border-t border-[#E5E5E5] space-y-3 mt-4">
                <div className="p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-black">
                    <span>Allowance</span>
                    <span className="font-mono">
                      {accessState.hasActiveSubscription
                        ? `${accessState.slotsUsed} (Unlimited)`
                        : `${accessState.slotsUsed} / ${accessState.maxSlots}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500">
                    {accessState.hasActiveSubscription
                      ? `Active on ${accessState.tierName}`
                      : `${accessState.maxSlots} clients in free trial`}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span className="truncate font-medium">{profile?.full_name || 'Staff User'}</span>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-red-600 hover:text-red-700 text-xs font-semibold"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Content Slot */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-6 md:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          <Outlet />
        </main>

        {/* Workspace In-App Footer */}
        <footer className="mt-auto py-3 px-4 border-t border-[#E5E5E5] bg-white text-center text-xs text-neutral-500 print:hidden pb-20 md:pb-3">
          <p>
            Designed and built by <span className="font-semibold text-black">Dev_OJ</span>
          </p>
        </footer>

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

