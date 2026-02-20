'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form' // NOTE: tambahkan react-hook-form ke package.json
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/schemas/auth.schema'
import { authApi } from '@/lib/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { generateDeviceFingerprint } from '@/lib/crypto/checksum'
import { parseErrorMessage } from '@/lib/utils/error'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useDeviceWarnings } from '@/hooks/use-device-warnings'
import { DeviceLockWarning } from './DeviceLockWarning'

const ROLE_DASHBOARD: Record<string, string> = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMIN: '/superadmin/dashboard',
  TEACHER: '/guru/dashboard',
  OPERATOR: '/operator/dashboard',
  SUPERVISOR: '/pengawas/dashboard',
  STUDENT: '/siswa/dashboard',
}

export function LoginForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { warnings, isOldBrowser } = useDeviceWarnings()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    try {
      const fingerprint = await generateDeviceFingerprint()
      const { user, accessToken } = await authApi.login({ ...data, fingerprint })
      setAuth(user, accessToken)
      router.replace(ROLE_DASHBOARD[user.role] ?? '/')
    } catch (e) {
      const msg = parseErrorMessage(e)
      // Cek apakah device locked
      if (msg.toLowerCase().includes('device') && msg.toLowerCase().includes('lock')) {
        setServerError('__DEVICE_LOCKED__')
      } else {
        setServerError(msg)
      }
    }
  }

  if (serverError === '__DEVICE_LOCKED__') return <DeviceLockWarning />

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
      {/* Device warnings */}
      {warnings.map((w, i) => (
        <Alert key={i} variant="warning">{w}</Alert>
      ))}

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Input
        label="Username"
        placeholder="Masukkan username"
        autoComplete="username"
        autoFocus
        error={errors.username?.message}
        disabled={isOldBrowser}
        {...register('username')}
      />

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text font-medium">Password</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            autoComplete="current-password"
            className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`}
            disabled={isOldBrowser}
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.password.message}</span>
          </label>
        )}
      </div>

      <Button
        type="submit"
        wide
        loading={isSubmitting}
        disabled={isOldBrowser}
        className="mt-2 w-full"
      >
        Masuk
      </Button>

      {isOldBrowser && (
        <p className="text-center text-xs text-error">
          Browser tidak didukung. Gunakan Chrome 80+ atau Firefox 90+.
        </p>
      )}
    </form>
  )
}
