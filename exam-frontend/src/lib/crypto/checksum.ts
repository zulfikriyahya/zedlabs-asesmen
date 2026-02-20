/**
 * SHA-256 checksum via Web Crypto API.
 * Digunakan untuk validasi integritas paket ujian setelah download.
 */

import { bufferToBase64 } from './aes-gcm';

export async function sha256Hex(data: string | ArrayBuffer): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Base64(data: string | ArrayBuffer): Promise<string> {
  const buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return bufferToBase64(hash);
}

/**
 * Validasi hash paket ujian yang didownload vs hash yang diterima dari server.
 * Melempar Error jika tidak cocok.
 */
export async function validatePackageHash(
  encryptedData: string,
  expectedHash: string,
): Promise<void> {
  const actual = await sha256Hex(encryptedData);
  if (actual !== expectedHash) {
    throw new Error(`Package hash mismatch. Expected: ${expectedHash}, got: ${actual}`);
  }
}

/**
 * Fingerprint device — SHA-256 dari kombinasi browser properties.
 * Digunakan oleh DeviceGuard untuk verifikasi perangkat.
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency?.toString() ?? '',
    screen.width.toString(),
    screen.height.toString(),
    screen.colorDepth.toString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.platform ?? '',
  ].join('|');

  return sha256Hex(components);
}
