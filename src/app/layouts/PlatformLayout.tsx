import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';
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
  HelpCircle
} from 'lucide-react';

export const PlatformLayout: React.FC = () => {
  const { profile, logout, isPlatformAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Platform Overview', path: '/platform/dashboard', icon: BarChart4 },
    { label: 'Registered Businesses', path: '/platform/businesses', icon: Building2 },
    { label: 'Subscriptions', path: '/platform/subscriptions', icon: Sliders },
    { label: 'Transactions', path: '/platform/transactions', icon: CreditCard },
    { label: 'Platform Audit Logs', path: '/platform/audit-logs', icon: History },
    { label: 'Platform Settings', path: '/platform/settings', icon: Settings },
  ];

  if (!isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-700/50 flex items-center justify-center mx-auto text-red-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
            <p className="text-sm text-neutral-400 mt-2">
              The SewDesk Platform Administration console is restricted strictly to verified internal system operators.
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 text-left font-mono">
            Security policy: User account ({profile?.email || 'unauthenticated'}) lacks platform administrator authorization.
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              className="border-neutral-700 text-white hover:bg-neutral-900"
              onClick={() => navigate('/app/dashboard')}
            >
              Return to Workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row">
      {/* Platform Operator Sidebar */}
      <aside className="w-full md:w-64 bg-black border-r border-neutral-800 flex flex-col shrink-0">
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
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-3">
          <Link
            to="/app/dashboard"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tailor Workspace</span>
          </Link>
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span className="truncate">{profile?.email}</span>
            <button
              onClick={() => logout()}
              className="text-neutral-400 hover:text-red-400 p-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Platform Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

