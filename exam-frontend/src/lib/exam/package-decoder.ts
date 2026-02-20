/**
 * Mendekripsi paket ujian terenkripsi dari server.
 * Hasil dekripsi hanya ada di memori — tidak pernah disimpan ke IndexedDB.
 */

import { decryptFromBase64 } from '@/lib/crypto/aes-gcm'
import { validatePackageHash } from '@/lib/crypto/checksum'
import { keyManager } from '@/lib/crypto/key-manager'
import type { EncryptedExamPackage, DecryptedExamPackage } from '@/types/exam'

export async function decryptExamPackage(
  encrypted: EncryptedExamPackage,
  sessionKey: string,     // base64 key dari server (response download)
): Promise<DecryptedExamPackage> {
  // 1. Validasi integritas paket sebelum dekripsi
  await validatePackageHash(encrypted.encryptedData, encrypted.packageHash)

  // 2. Import key ke memori (non-extractable CryptoKey)
  await keyManager.set(encrypted.sessionId, sessionKey)
  const key = keyManager.get(encrypted.sessionId)

  // 3. Dekripsi
  const plaintext = await decryptFromBase64(key, encrypted.encryptedData, encrypted.iv)
  const pkg = JSON.parse(plaintext) as DecryptedExamPackage

  return pkg
}

/**
 * Setelah paket didekripsi dan aktif di memori, panggil ini
 * untuk membersihkan key jika tidak butuh lagi
 * (key tetap dipertahankan selama sesi berlangsung untuk auto-save terenkripsi jika diperlukan)
 */
export function clearPackageKey(sessionId: string): void {
  keyManager.clear(sessionId)
}
