// ── services/auto-grading.service.ts ─────────────────────
import { Injectable as IG } from '@nestjs/common';
import { decrypt } from '../../../common/utils/encryption.util';
import { ConfigService } from '@nestjs/config';
import { cosineSimilarity } from '../../../common/utils/similarity.util';
import { QuestionType } from '../../../common/enums/question-type.enum';

@IG()
export class AutoGradingService {
  constructor(private cfg: ConfigService) {}

  private get encKey() {
    return this.cfg.get<string>('ENCRYPTION_KEY', '');
  }

  gradeAnswer(
    type: QuestionType,
    encryptedCorrectAnswer: string,
    studentAnswer: unknown,
    maxScore: number,
  ): GradingResult {
    const ca = JSON.parse(decrypt(encryptedCorrectAnswer as string, this.encKey));

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return this.gradeExact(ca.value, studentAnswer, maxScore);

      case QuestionType.COMPLEX_MULTIPLE_CHOICE:
        return this.gradeMultiple(ca.value as string[], studentAnswer as string[], maxScore);

      case QuestionType.MATCHING:
        return this.gradeMatching(
          ca.value as Record<string, string>,
          studentAnswer as Record<string, string>,
          maxScore,
        );

      case QuestionType.SHORT_ANSWER:
        return this.gradeShortAnswer(ca, studentAnswer as string, maxScore);

      case QuestionType.ESSAY:
        return this.gradeEssay(ca, studentAnswer as string, maxScore);

      default:
        return { questionId: '', score: 0, maxScore, isCorrect: false, requiresManual: true };
    }
  }

  private gradeExact(correct: unknown, student: unknown, max: number): GradingResult {
    const ok = String(correct).toLowerCase() === String(student).toLowerCase();
    return {
      questionId: '',
      score: ok ? max : 0,
      maxScore: max,
      isCorrect: ok,
      requiresManual: false,
    };
  }

  private gradeMultiple(correct: string[], student: string[], max: number): GradingResult {
    const correctSet = new Set(correct);
    const studentSet = new Set(student);
    const allCorrect =
      correct.every((c) => studentSet.has(c)) && student.every((s) => correctSet.has(s));
    // partial scoring: (correct - wrong) / total
    const correctHits = student.filter((s) => correctSet.has(s)).length;
    const wrong = student.filter((s) => !correctSet.has(s)).length;
    const score = Math.max(0, ((correctHits - wrong) / correct.length) * max);
    return {
      questionId: '',
      score: Math.round(score * 100) / 100,
      maxScore: max,
      isCorrect: allCorrect,
      requiresManual: false,
    };
  }

  private gradeMatching(
    correct: Record<string, string>,
    student: Record<string, string>,
    max: number,
  ): GradingResult {
    const keys = Object.keys(correct);
    const hits = keys.filter((k) => correct[k] === student[k]).length;
    const score = (hits / keys.length) * max;
    return {
      questionId: '',
      score: Math.round(score * 100) / 100,
      maxScore: max,
      isCorrect: hits === keys.length,
      requiresManual: false,
    };
  }

  private gradeShortAnswer(
    ca: { value: string; caseSensitive?: boolean; similarityThreshold?: number },
    student: string,
    max: number,
  ): GradingResult {
    const a = ca.caseSensitive ? ca.value : ca.value.toLowerCase();
    const b = ca.caseSensitive ? student : student.toLowerCase();
    const threshold = ca.similarityThreshold ?? 0.9;
    const sim = cosineSimilarity(a, b);
    const ok = sim >= threshold;
    return {
      questionId: '',
      score: ok ? max : 0,
      maxScore: max,
      isCorrect: ok,
      requiresManual: false,
    };
  }

  private gradeEssay(_ca: unknown, _student: string, max: number): GradingResult {
    // Essay selalu manual
    return { questionId: '', score: 0, maxScore: max, isCorrect: false, requiresManual: true };
  }
}
