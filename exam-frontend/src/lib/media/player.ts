import { mediaApi } from '@/lib/api/media.api';

const _cache = new Map<string, { url: string; expiresAt: number }>();

export async function getMediaUrl(objectKey: string): Promise<string> {
  const cached = _cache.get(objectKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.url;

  const { url, expiresAt } = await mediaApi.getPresignedUrl(objectKey);
  _cache.set(objectKey, { url, expiresAt: new Date(expiresAt).getTime() });
  return url;
}
