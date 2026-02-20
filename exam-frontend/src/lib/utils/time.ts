export function secondsToMinutes(s: number): number {
  return Math.floor(s / 60)
}

export function minutesToSeconds(m: number): number {
  return m * 60
}

export function isExpired(expiresAt: string | number): boolean {
  const ts = typeof expiresAt === 'string' ? new Date(expiresAt).getTime() : expiresAt
  return Date.now() > ts
}

export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
