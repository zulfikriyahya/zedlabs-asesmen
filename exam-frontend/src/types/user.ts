import type { ID, UserRole } from './common'

export interface User {
  id: ID
  tenantId: ID
  email: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserDevice {
  id: ID
  userId: ID
  fingerprint: string
  label: string | null
  isLocked: boolean
  lockedAt: string | null
  lastSeenAt: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser extends User {
  tenantSubdomain: string
}

export interface JwtPayload {
  sub: ID
  tenantId: ID
  role: UserRole
  username: string
  iat: number
  exp: number
}
