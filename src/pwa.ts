/** Production PWA registration never blocks play or reloads a session. */
export interface PwaStatus {
  supported: boolean;
  offlineReady: boolean;
  updateAvailable: boolean;
  online: boolean;
  build?: string;
  error?: string;
}

export function registerPwa(onStatus: (status: Readonly<PwaStatus>) => void): void {
  const status: PwaStatus = {
    supported: 'serviceWorker' in navigator && window.isSecureContext,
    offlineReady: false,
    updateAvailable: false,
    online: navigator.onLine,
  };
  const emit = (): void => onStatus({ ...status });
  const report = (error: unknown): void => {
    status.error = error instanceof Error ? error.message : String(error);
    console.warn('[PWA]', error);
    emit();
  };
  const network = (): void => { status.online = navigator.onLine; emit(); };
  window.addEventListener('online', network);
  window.addEventListener('offline', network);
  emit();
  if (!status.supported || import.meta.env.DEV) return;

  const serviceWorker = navigator.serviceWorker;
  const readStatus = (): void => {
    const worker = serviceWorker.controller;
    if (!worker) return;
    const channel = new MessageChannel();
    const timeout = window.setTimeout(() => {
      channel.port1.close();
      report(new Error('Offline status check timed out.'));
    }, 5000);
    channel.port1.onmessage = (event: MessageEvent<{ offlineReady: boolean; build: string; error?: string }>) => {
      window.clearTimeout(timeout);
      channel.port1.close();
      status.offlineReady = event.data.offlineReady === true;
      status.build = event.data.build;
      status.error = event.data.error;
      emit();
    };
    worker.postMessage({ type: 'STATUS' }, [channel.port2]);
  };
  serviceWorker.addEventListener('controllerchange', readStatus);
  void serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).then((registration) => {
    const waiting = (): void => {
      status.updateAvailable = Boolean(registration.waiting && serviceWorker.controller);
      emit();
    };
    const watch = (): void => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') waiting();
        if (worker.state === 'activated') readStatus();
        if (worker.state === 'redundant') report(new Error('Offline installation failed. The game can still play online.'));
      });
    };
    registration.addEventListener('updatefound', watch);
    watch();
    waiting();
    readStatus();
    // Check when a parent reopens the app; downloading an update never interrupts play.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      readStatus();
      void registration.update().catch(report);
    });
  }).catch(report);
}
