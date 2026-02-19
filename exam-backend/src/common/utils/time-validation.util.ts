// ── time-validation.util.ts ──────────────────────────────────────────────────
export function isWithinWindow(start: Date, end: Date, now = new Date()): boolean {
  return now >= start && now <= end;
}

export function secondsRemaining(end: Date, now = new Date()): number {
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}
