import { z } from 'zod';

export const answerValueSchema = z.union([z.string(), z.array(z.string()), z.record(z.string())]);

export const submitAnswerSchema = z.object({
  attemptId: z.string().cuid(),
  questionId: z.string().cuid(),
  idempotencyKey: z.string().uuid(),
  answer: answerValueSchema,
  mediaUrls: z.array(z.string()).optional(),
});

export const gradeAnswerSchema = z.object({
  answerId: z.string().cuid(),
  score: z.number().min(0),
  feedback: z.string().optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type GradeAnswerInput = z.infer<typeof gradeAnswerSchema>;
