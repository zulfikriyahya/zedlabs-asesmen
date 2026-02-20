/**
 * Auto-save logic — persist jawaban ke IndexedDB.
 * Dipanggil via debounce dari useAutoSave hook, bukan interval.
 */

import { upsertAnswer } from '@/lib/db/queries';
import type { LocalAnswer } from '@/types/answer';
import type { AnswerValue } from '@/types/answer';
import type { ID } from '@/types/common';
import { v4 as uuidv4 } from 'uuid';

export interface SaveAnswerParams {
  questionId: ID;
  attemptId: ID;
  sessionId: ID;
  answer: AnswerValue;
  mediaUrls?: string[];
  existingIdempotencyKey?: string; // reuse key jika sudah ada (update, bukan insert baru)
}

export async function saveAnswerToLocal(params: SaveAnswerParams): Promise<number> {
  const {
    questionId,
    attemptId,
    sessionId,
    answer,
    mediaUrls = [],
    existingIdempotencyKey,
  } = params;

  const record: Omit<LocalAnswer, 'id'> = {
    questionId,
    attemptId,
    sessionId,
    idempotencyKey: existingIdempotencyKey ?? uuidv4(),
    answer,
    mediaUrls,
    savedAt: Date.now(),
    synced: false,
  };

  return upsertAnswer(record);
}

/**
 * Debounce factory — returns fungsi yang menunda eksekusi selama `delay` ms.
 * Setiap panggilan baru membatalkan timer sebelumnya.
 */
export function createDebounce<T extends (...args: Parameters<T>) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}
