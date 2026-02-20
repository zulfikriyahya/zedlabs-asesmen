import { z } from 'zod'

export const examPackageSettingsSchema = z.object({
  duration: z.number().int().positive('Durasi harus lebih dari 0 menit'),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResult: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).default(1),
})

export const createExamPackageSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  description: z.string().optional(),
  subjectId: z.string().cuid().optional(),
  settings: examPackageSettingsSchema,
})

export const createSessionSchema = z.object({
  examPackageId: z.string().cuid(),
  roomId: z.string().cuid().optional(),
  title: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine(d => new Date(d.endTime) > new Date(d.startTime), {
  message: 'Waktu selesai harus setelah waktu mulai',
  path: ['endTime'],
})

export type CreateExamPackageInput = z.infer<typeof createExamPackageSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
