import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop
 * Automatically resets scroll position to top (0, 0)
 * on every page navigation / route change.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
};

/**
 * BackToTopButton
 * Floating, elegant button that appears when scrolled down
 * and smoothly sends the user back to the top of the page.
 */
export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      title="Send to top"
      aria-label="Send to top of page"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-black text-white hover:bg-neutral-800 active:scale-95 shadow-xl border border-neutral-700 transition-all duration-300 flex items-center justify-center cursor-pointer animate-in fade-in zoom-in-95 group"
    >
      <ArrowUp className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};

