/**
 * AES-256-GCM via Web Crypto API.
 * Key hanya hidup di memori (CryptoKey object) — tidak pernah dieksport ke string
 * kecuali untuk transport saat key-exchange awal.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // bytes — rekomendasi NIST untuk GCM

// ── Key generation & import ───────────────────────────────────────────────────

/**
 * Generate CryptoKey baru (hanya untuk testing / key-exchange).
 * Di production, key diterima dari server dalam paket download.
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGO, length: KEY_LENGTH },
    true, // extractable — hanya untuk initial export ke server
    ['encrypt', 'decrypt'],
  );
}

/**
 * Import raw key dari bytes (diterima dari server dalam paket download).
 * Setelah diimport, CryptoKey tidak bisa dieksport kembali (extractable: false).
 */
export async function importKey(rawKey: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGO, length: KEY_LENGTH },
    false, // non-extractable — tidak bisa keluar dari memori
    ['decrypt'],
  );
}

/**
 * Import key dari base64 string (format transport dari server).
 */
export async function importKeyFromBase64(b64: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(b64);
  return importKey(raw);
}

// ── Encrypt ───────────────────────────────────────────────────────────────────

export interface EncryptResult {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

export async function encrypt(key: CryptoKey, plaintext: string): Promise<EncryptResult> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGO, iv }, key, encoded);
  return { ciphertext, iv };
}

export async function encryptToBase64(
  key: CryptoKey,
  plaintext: string,
): Promise<{ ciphertext: string; iv: string }> {
  const { ciphertext, iv } = await encrypt(key, plaintext);
  return { ciphertext: bufferToBase64(ciphertext), iv: bufferToBase64(iv) };
}

// ── Decrypt ───────────────────────────────────────────────────────────────────

export async function decrypt(
  key: CryptoKey,
  ciphertext: ArrayBuffer,
  iv: Uint8Array,
): Promise<string> {
  const plain = await crypto.subtle.decrypt({ name: ALGO, iv }, key, ciphertext);
  return new TextDecoder().decode(plain);
}

export async function decryptFromBase64(
  key: CryptoKey,
  ciphertextB64: string,
  ivB64: string,
): Promise<string> {
  const ciphertext = base64ToBuffer(ciphertextB64);
  const iv = new Uint8Array(base64ToBuffer(ivB64));
  return decrypt(key, ciphertext, iv);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str);
}

export function base64ToBuffer(b64: string): ArrayBuffer {
  const str = atob(b64);
  const buf = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
  return buf.buffer;
}
