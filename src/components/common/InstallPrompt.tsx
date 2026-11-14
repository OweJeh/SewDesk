import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

// Tracks whether we've already shown the prompt this session
const SESSION_KEY = 'sewdesk_install_prompt_dismissed';
const INSTALL_DISMISSED_KEY = 'sewdesk_install_dismissed_forever';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Already installed as PWA — never show
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    // User permanently dismissed
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;

    // Detect iOS Safari (needs manual "Add to Home Screen")
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(navigator as any).standalone &&
      !window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(ios);

    if (ios) {
      // Show iOS guide after 45 seconds
      const t = setTimeout(() => setShow(true), 45000);
      return () => clearTimeout(t);
    }

    // Android / Chrome — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after 50 seconds of use (≈ 1 minute)
      setTimeout(() => setShow(true), 50000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also listen for appinstalled to auto-hide
    const installed = () => {
      setIsInstalled(true);
      setShow(false);
    };
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSGuide(false);
    localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
  };

  const handleLater = () => {
    setShow(false);
    setShowIOSGuide(false);
    // Don't set permanent dismiss — let it show again on next full session load
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (isInstalled || !show) return null;

  // iOS step-by-step guide
  if (isIOS && showIOSGuide) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4 pb-6">
        <div className="absolute inset-0 bg-black/40" onClick={handleLater} />
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                <img src="/icons/icon-192.png" alt="SewDesk" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#111]">Add SewDesk to Home Screen</p>
                <p className="text-[11px] text-[#777]">3 quick steps on Safari</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors">
              <X size={16} className="text-[#777]" />
            </button>
          </div>

          {/* Steps */}
          <div className="px-5 py-4 space-y-4">
            {[
              { n: 1, text: 'Tap the Share button (□↑) at the bottom of Safari' },
              { n: 2, text: 'Scroll down and tap "Add to Home Screen"' },
              { n: 3, text: 'Tap "Add" — SewDesk appears on your home screen' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </span>
                <p className="text-[13px] text-[#333] leading-snug">{text}</p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={handleLater}
              className="w-full py-2.5 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#777] hover:bg-[#F5F5F5] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android / Chrome native banner
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
      style={{ animation: 'sewdesk-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <style>{`
        @keyframes sewdesk-slide-up {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to   { transform: translate(-50%, 0);   opacity: 1; }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden">
        {/* Top strip */}
        <div className="h-1 bg-black w-full" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* App icon */}
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
              <img src="/icons/icon-192.png" alt="SewDesk" className="w-full h-full object-contain" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#111] leading-tight">
                Install SewDesk
              </p>
              <p className="text-[12px] text-[#777] leading-snug mt-0.5">
                Add to your home screen for the full app experience — works offline too.
              </p>
            </div>

            {/* Close */}
            <button
              onClick={handleLater}
              className="p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors flex-shrink-0 -mt-0.5"
              aria-label="Dismiss"
            >
              <X size={16} className="text-[#777]" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleLater}
              className="flex-1 py-2 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#777] hover:bg-[#F5F5F5] transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors flex items-center justify-center gap-1.5"
            >
              <Download size={13} />
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

