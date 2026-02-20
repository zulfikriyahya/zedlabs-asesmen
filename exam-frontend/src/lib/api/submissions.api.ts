import { apiGet, apiPost } from './client';
import type { ExamAttempt, ExamResult, EncryptedExamPackage } from '@/types/exam';
import type { SubmitAnswerPayload } from '@/types/answer';
import type { ID } from '@/types/common';

export interface StartAttemptPayload {
  tokenCode: string;
  idempotencyKey: string;
  deviceFingerprint: string;
}

export interface StartAttemptResponse {
  attempt: ExamAttempt;
  encryptedPackage: EncryptedExamPackage;
  sessionKey: string;
}

export interface SubmitExamPayload {
  attemptId: ID;
  idempotencyKey: string;
}

export const submissionsApi = {
  startAttempt: (payload: StartAttemptPayload) =>
    apiPost<StartAttemptResponse>('student/download', payload),

  submitAnswer: (payload: SubmitAnswerPayload) => apiPost<void>('student/answers', payload),

  submitExam: (payload: SubmitExamPayload) => apiPost<ExamAttempt>('student/submit', payload),

  getResult: (attemptId: ID) => apiGet<ExamResult>(`student/result/${attemptId}`),

  getAttempts: () => apiGet<ExamAttempt[]>('student/attempts'),
};
