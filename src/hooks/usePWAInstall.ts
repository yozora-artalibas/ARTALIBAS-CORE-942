import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPwaInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

let sharedDeferredPrompt: BeforeInstallPromptEvent | null =
  typeof window !== 'undefined' ? window.__deferredPwaInstallPrompt || null : null;
let sharedIsInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  const checkStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;

  sharedIsInstalled = checkStandalone();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    sharedDeferredPrompt = e as BeforeInstallPromptEvent;
    window.__deferredPwaInstallPrompt = sharedDeferredPrompt;
    notifyListeners();
  });

  window.addEventListener('pwa-prompt-captured', () => {
    sharedDeferredPrompt = window.__deferredPwaInstallPrompt || null;
    if (!sharedDeferredPrompt && checkStandalone()) {
      sharedIsInstalled = true;
    }
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    sharedIsInstalled = true;
    sharedDeferredPrompt = null;
    window.__deferredPwaInstallPrompt = null;
    notifyListeners();
  });
}

export function isTemporaryPreviewHost(hostname: string): boolean {
  return /^ais-dev-/i.test(hostname);
}

export function usePWAInstall() {
  const [, setTick] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isTemporaryPreview, setIsTemporaryPreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.__deferredPwaInstallPrompt && !sharedDeferredPrompt) {
      sharedDeferredPrompt = window.__deferredPwaInstallPrompt;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsTemporaryPreview(isTemporaryPreviewHost(window.location.hostname));

    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    listener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const install = useCallback(async () => {
    const promptEvent =
      sharedDeferredPrompt ||
      (typeof window !== 'undefined' ? window.__deferredPwaInstallPrompt : null);

    if (!promptEvent) return false;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      sharedIsInstalled = true;
      sharedDeferredPrompt = null;
      if (typeof window !== 'undefined') {
        window.__deferredPwaInstallPrompt = null;
      }
      notifyListeners();
      return true;
    }
    return false;
  }, []);

  return {
    isInstallable: !!(sharedDeferredPrompt || (typeof window !== 'undefined' && window.__deferredPwaInstallPrompt)),
    isInstalled: sharedIsInstalled,
    isIOS,
    isInIframe,
    isTemporaryPreview,
    install,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
