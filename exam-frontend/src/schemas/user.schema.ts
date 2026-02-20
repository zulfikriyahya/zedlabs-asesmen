import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'TEACHER', 'SUPERVISOR', 'OPERATOR', 'STUDENT']),
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
