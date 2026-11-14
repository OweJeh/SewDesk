import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { router } from '@/app/router';
import { SewDeskSplashScreen } from '@/components/brand/SewDeskSplashScreen';
import { InstallPrompt } from '@/components/common/InstallPrompt';

// SW update toast — shown when a new version of SewDesk is deployed
function UpdateToast() {
  const [show, setShow] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onUpdate = (reg: ServiceWorkerRegistration) => {
      setRegistration(reg);
      setShow(true);
    };

    // The VitePWA plugin exposes a custom event when a new SW is waiting
    const handler = (e: Event) => {
      onUpdate((e as CustomEvent).detail as ServiceWorkerRegistration);
    };

    window.addEventListener('sw-updated', handler);
    return () => window.removeEventListener('sw-updated', handler);
  }, []);

  const reload = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-sm bg-black text-white rounded-xl shadow-xl px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-[13px] font-medium leading-tight">SewDesk updated — restart to get the latest.</p>
      <button
        onClick={reload}
        className="text-[13px] font-semibold underline underline-offset-2 whitespace-nowrap"
      >
        Reload
      </button>
    </div>
  );
}

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('splash')) return true;
    if (window.location.pathname === '/splash') return false;
    return !sessionStorage.getItem('sewdesk_splash_shown');
  });

  return (
    <AppProviders>
      {showSplash && (
        <SewDeskSplashScreen
          onComplete={() => setShowSplash(false)}
          autoDismiss={true}
        />
      )}
      <RouterProvider router={router} />
      <InstallPrompt />
      <UpdateToast />
    </AppProviders>
  );
};

export default App;
