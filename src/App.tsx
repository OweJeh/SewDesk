import React, { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { router } from '@/app/router';
import { SewDeskSplashScreen } from '@/components/brand/SewDeskSplashScreen';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('splash')) return true;
    if (window.location.pathname === '/splash') return false; // Handled by demo page
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
    </AppProviders>
  );
};

export default App;
