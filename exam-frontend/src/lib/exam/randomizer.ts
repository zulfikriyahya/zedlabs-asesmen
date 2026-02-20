/**
 * Fisher-Yates shuffle menggunakan crypto.getRandomValues untuk keacakan yang kuat.
 */

import type { ExamQuestion } from '@/types/question';
import type { MultipleChoiceOption } from '@/types/question';

function cryptoShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0]! % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function shuffleQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  return cryptoShuffle(questions);
}

export function shuffleOptions(question: ExamQuestion): ExamQuestion {
  if (!question.options || !Array.isArray(question.options)) return question;
  return {
    ...question,
    options: cryptoShuffle(question.options as MultipleChoiceOption[]),
  };
}

/**
 * Terapkan pengacakan sesuai settings paket ujian.
 * Dipanggil sekali setelah dekripsi — hasilnya disimpan sebagai questionOrder di exam store.
 */
export function applyRandomization(
  questions: ExamQuestion[],
  settings: { shuffleQuestions: boolean; shuffleOptions: boolean },
): ExamQuestion[] {
  let q = settings.shuffleQuestions ? shuffleQuestions(questions) : [...questions];
  if (settings.shuffleOptions) q = q.map(shuffleOptions);
  return q;
}
