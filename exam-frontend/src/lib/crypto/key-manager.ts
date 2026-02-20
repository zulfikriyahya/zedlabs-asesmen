/**
 * Key manager — menyimpan CryptoKey di memori selama sesi aktif.
 * Key TIDAK pernah keluar dari object ini ke localStorage/IndexedDB/Zustand persist.
 *
 * Lifecycle:
 *   1. Server kirim rawKey (base64) dalam response download paket.
 *   2. importKeyFromBase64() → CryptoKey (non-extractable).
 *   3. Key disimpan di Map ini; dipakai decrypt paket & jawaban.
 *   4. clearKey() dipanggil saat tab ditutup / logout / submit selesai.
 */

import { importKeyFromBase64 } from './aes-gcm';

type SessionId = string;

const _keys = new Map<SessionId, CryptoKey>();

export const keyManager = {
  /**
   * Set key untuk session tertentu dari base64 string (dari server).
   */
  async set(sessionId: SessionId, rawKeyB64: string): Promise<void> {
    const key = await importKeyFromBase64(rawKeyB64);
    _keys.set(sessionId, key);
  },

  /**
   * Ambil key untuk session. Throws jika tidak ada (sesi tidak valid).
   */
  get(sessionId: SessionId): CryptoKey {
    const key = _keys.get(sessionId);
    if (!key) throw new Error(`No active key for session: ${sessionId}`);
    return key;
  },

  has(sessionId: SessionId): boolean {
    return _keys.has(sessionId);
  },

  /**
   * Hapus key saat sesi berakhir (submit / logout / timeout).
   */
  clear(sessionId: SessionId): void {
    _keys.delete(sessionId);
  },

  clearAll(): void {
    _keys.clear();
  },
};

// Auto-clear saat tab ditutup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => keyManager.clearAll());
}
