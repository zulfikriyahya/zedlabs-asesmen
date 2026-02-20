import { z } from 'zod'
import { QUESTION_TYPES } from '@/types/common'

export const questionContentSchema = z.object({
  text: z.string().min(1, 'Konten soal wajib diisi'),
  images: z.array(z.string()).optional(),
  audio: z.string().optional(),
  video: z.string().optional(),
})

export const multipleChoiceOptionSchema = z.object({
  key: z.string(),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
})

export const createQuestionSchema = z.object({
  subjectId: z.string().cuid(),
  type: z.enum(['MULTIPLE_CHOICE', 'COMPLEX_MULTIPLE_CHOICE', 'TRUE_FALSE', 'MATCHING', 'SHORT_ANSWER', 'ESSAY']),
  content: questionContentSchema,
  options: z.unknown().optional(),
  correctAnswer: z.unknown(),
  points: z.number().int().min(1).default(1),
  difficulty: z.number().int().min(1).max(5).default(1),
  tagIds: z.array(z.string().cuid()).optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
