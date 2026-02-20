import { saveExamPackage, getExamPackage, purgeExpiredPackages } from '@/lib/db/queries'
import { isExpired } from '@/lib/utils/time'
import type { EncryptedExamPackage } from '@/types/exam'
import type { StoredExamPackage } from '@/lib/db/schema'

export async function cacheEncryptedPackage(pkg: EncryptedExamPackage): Promise<void> {
  const stored: StoredExamPackage = {
    sessionId: pkg.sessionId,
    attemptId: pkg.attemptId,
    packageHash: pkg.packageHash,
    encryptedData: pkg.encryptedData,
    iv: pkg.iv,
    expiresAt: new Date(pkg.expiresAt).getTime(),
    storedAt: Date.now(),
  }
  await saveExamPackage(stored)
}

export async function loadCachedPackage(sessionId: string): Promise<StoredExamPackage | null> {
  const pkg = await getExamPackage(sessionId)
  if (!pkg) return null
  if (isExpired(pkg.expiresAt)) {
    await purgeExpiredPackages()
    return null
  }
  return pkg
}
