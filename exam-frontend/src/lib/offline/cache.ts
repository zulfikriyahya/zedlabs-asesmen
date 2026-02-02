export const CACHE_NAME = 'exam-assets-v1';

export async function cacheAssets(urls: string[]) {
  if ('caches' in window) {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
  }
}

export async function clearOldCaches(currentCache: string) {
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(key => {
        if (key !== currentCache) return caches.delete(key);
      })
    );
  }
}