// src/lib/utils/network.ts
export function isOnline(): boolean {
  return navigator.onLine;
}

export function waitForOnline(): Promise<void> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
}

export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export async function checkConnection(url: string = '/api/health'): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export function getConnectionType(): string {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.effectiveType || 'unknown';
}