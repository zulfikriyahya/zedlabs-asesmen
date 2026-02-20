import { z } from 'zod'

export const syncItemSchema = z.object({
  type: z.enum(['SUBMIT_ANSWER', 'SUBMIT_EXAM', 'UPLOAD_MEDIA', 'ACTIVITY_LOG']),
  attemptId: z.string(),
  idempotencyKey: z.string().uuid(),
  payload: z.record(z.unknown()),
})

export const syncBatchSchema = z.object({
  batch: z.array(syncItemSchema).min(1).max(50),
})

export type SyncItemInput = z.infer<typeof syncItemSchema>
