import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency || 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Universal RFC4122 v4 UUID generator (safe in secure & non-secure contexts, LAN IPs, and older browsers)
export function generateUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {
        // Fallback if randomUUID fails in restricted context
      }
    }
    if (typeof crypto.getRandomValues === 'function') {
      try {
        return ('' + [1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
          (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
        );
      } catch {
        // Fallback
      }
    }
  }

  // Pure Math.random fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Universal clipboard copy function with multi-tier fallback.
 * Works seamlessly in secure contexts (HTTPS/localhost), non-secure contexts (LAN IPs/HTTP),
 * iframes, iOS Safari, Android Chrome, and PWAs without throwing unhandled exceptions.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Tier 1: Modern navigator.clipboard API (if allowed and available)
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function' &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('navigator.clipboard.writeText blocked or failed, attempting fallback...', e);
    }
  }

  // Tier 2: Universal document.execCommand('copy') with hidden textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) return true;
  } catch (err) {
    console.warn('execCommand copy fallback failed', err);
  }

  // Tier 3: Prompt dialog as guaranteed fallback for user to manually copy
  try {
    window.prompt('Copy to clipboard: Ctrl+C / Cmd+C, Enter', text);
    return true;
  } catch {
    return false;
  }
}


