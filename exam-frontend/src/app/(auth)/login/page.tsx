import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Login' }

export default function LoginPage() {
  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold">Masuk</h2>
        <p className="text-sm text-base-content/60">Sistem Ujian Sekolah & Madrasah</p>
        <LoginForm />
      </div>
    </div>
  )
}
