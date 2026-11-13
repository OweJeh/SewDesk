import React, { useCallback, useEffect, useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCcw,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

const typeIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-4 h-4" />;
    case 'warning': return <AlertTriangle className="w-4 h-4" />;
    case 'alert':   return <AlertCircle   className="w-4 h-4" />;
    default:        return <Info           className="w-4 h-4" />;
  }
};

const typeClasses = (type: NotificationItem['type']) => {
  switch (type) {
    case 'success': return 'bg-green-50 text-green-700 border-green-200';
    case 'warning': return 'bg-amber-50  text-amber-700  border-amber-200';
    case 'alert':   return 'bg-red-50    text-red-700    border-red-200';
    default:        return 'bg-black     text-white      border-black';
  }
};

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0)  return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins  > 0)  return `${mins}m ago`;
  return 'Just now';
};

// ─── Static seed for new businesses (shown once; dismissed via mark-read) ──
const seedNotifications = (businessName: string, profileId: string): NotificationItem[] => [
  {
    id: 'seed-welcome',
    business_id: 'seed',
    recipient_profile_id: profileId,
    title: 'Welcome to SewDesk!',
    message: `${businessName} is now live. Start by adding your first customer and taking their measurements.`,
    type: 'success',
    is_read: false,
    link_url: '/app/customers/new',
    created_at: new Date().toISOString(),
  },
  {
    id: 'seed-allowance',
    business_id: 'seed',
    recipient_profile_id: profileId,
    title: 'Free Starter Plan Active',
    message: 'Your studio has 100 free customer records. Upgrade to Pro Tailor Studio for unlimited customers and advanced reporting.',
    type: 'info',
    is_read: false,
    link_url: '/app/subscription',
    created_at: new Date(Date.now() - 60_000).toISOString(),
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

type FilterType = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'alert';

export const NotificationsPage: React.FC = () => {
  const { currentBusiness } = useCurrentBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLive = isSupabaseConfigured();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  // ── load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!currentBusiness || !user) return;
    setIsLoading(true);
    setError(null);

    try {
      if (isLive) {
        const { data, error: qErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('business_id', currentBusiness.id)
          .eq('recipient_profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (qErr) throw qErr;
        const liveNotifs: NotificationItem[] = data || [];

        // Augment with seed welcome notices if the inbox is fresh
        if (liveNotifs.length === 0) {
          setNotifications(seedNotifications(currentBusiness.business_name, user.id));
        } else {
          setNotifications(liveNotifs);
        }
      } else {
        // Offline / local mode — show seed
        setNotifications(seedNotifications(currentBusiness.business_name, user.id));
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness, user, isLive]);

  useEffect(() => { load(); }, [load]);

  // ── mark one read ────────────────────────────────────────────────────────
  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (isLive && !id.startsWith('seed-')) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    }
  };

  // ── mark all read ────────────────────────────────────────────────────────
  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (isLive && currentBusiness && user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('business_id', currentBusiness.id)
        .eq('recipient_profile_id', user.id)
        .eq('is_read', false);
    }
  };

  // ── delete one ───────────────────────────────────────────────────────────
  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (isLive && !id.startsWith('seed-')) {
      await supabase.from('notifications').delete().eq('id', id);
    }
  };

  // ── filter ───────────────────────────────────────────────────────────────
  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'all')    return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── tabs ─────────────────────────────────────────────────────────────────
  const tabs: { label: string; value: FilterType }[] = [
    { label: 'All',     value: 'all'     },
    { label: 'Unread',  value: 'unread'  },
    { label: 'Info',    value: 'info'    },
    { label: 'Success', value: 'success' },
    { label: 'Warning', value: 'warning' },
    { label: 'Alert',   value: 'alert'   },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-black text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Studio alerts, order updates, customer milestones, and system notices.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            className="gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-black text-white'
                : 'bg-white border border-[#E5E5E5] text-neutral-600 hover:border-black'
            }`}
          >
            {tab.label}
            {tab.value === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm divide-y divide-[#E5E5E5]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-neutral-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 bg-neutral-100 rounded" />
                <div className="h-3 w-64 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-50 border border-[#E5E5E5] flex items-center justify-center">
            <Inbox className="w-7 h-7 text-neutral-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700">All caught up</p>
            <p className="text-xs text-neutral-400 mt-1">
              {filter === 'unread' ? 'No unread notifications.' : 'No notifications in this category.'}
            </p>
          </div>
        </div>
      )}

      {/* Notification list */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm divide-y divide-[#E5E5E5]">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-3 group transition-colors ${
                !n.is_read ? 'bg-neutral-50/70' : 'hover:bg-neutral-50/40'
              }`}
            >
              {/* Type icon */}
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${typeClasses(n.type)}`}
              >
                {typeIcon(n.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-black shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-black leading-snug">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                    {relativeTime(n.created_at)}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 pl-4 leading-relaxed">
                  {n.message}
                </p>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-2 pl-4">
                  {n.link_url && (
                    <button
                      onClick={() => {
                        markRead(n.id);
                        navigate(n.link_url as string);
                      }}
                      className="text-[10px] font-semibold text-black underline-offset-2 hover:underline flex items-center gap-0.5"
                    >
                      View
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-[10px] text-neutral-400 hover:text-black transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-[10px] text-neutral-300 hover:text-red-500 transition-colors ml-auto"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {!isLoading && notifications.length > 0 && (
        <p className="text-xs text-neutral-400 text-center pb-2">
          Showing {filtered.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
};
