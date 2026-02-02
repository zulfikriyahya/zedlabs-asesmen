// src/lib/utils/storage.ts
export async function checkStorageSpace(): Promise<{
  available: number;
  total: number;
  used: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      available: (estimate.quota || 0) - (estimate.usage || 0),
      total: estimate.quota || 0,
      used: estimate.usage || 0,
    };
  }
  
  return {
    available: 0,
    total: 0,
    used: 0,
  };
}

export async function getStorageUsageGB(): Promise<number> {
  const storage = await checkStorageSpace();
  return storage.used / (1024 ** 3);
}

export async function hasEnoughSpace(requiredBytes: number): Promise<boolean> {
  const storage = await checkStorageSpace();
  return storage.available >= requiredBytes;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    return await navigator.storage.persist();
  }
  return false;
}

export async function isPersisted(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    return await navigator.storage.persisted();
  }
  return false;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}