import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Tier definitions:
 *
 * STRICT   — endpoint kritis: download paket, submit ujian
 *            5 req / 60 detik per user
 *
 * MODERATE — endpoint semi-kritis: submit jawaban, upload chunk
 *            30 req / 60 detik per user
 *
 * RELAXED  — endpoint baca biasa: list, get detail
 *            120 req / 60 detik per user  (override default 100)
 *
 * OPEN     — endpoint yang tidak perlu throttle sama sekali
 */
export const ThrottleStrict = () => Throttle({ default: { limit: 5, ttl: 60_000 } });
export const ThrottleModerate = () => Throttle({ default: { limit: 30, ttl: 60_000 } });
export const ThrottleRelaxed = () => Throttle({ default: { limit: 120, ttl: 60_000 } });
export const ThrottleOpen = () => SkipThrottle();
