import { MainLayout } from '@/components/layout/MainLayout'

const SISWA_NAV = [
  { href: '/siswa/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/siswa/ujian', label: 'Ujian Saya', icon: 'book-open' },
  { href: '/siswa/profile', label: 'Profil', icon: 'user' },
]

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={SISWA_NAV} role="STUDENT">{children}</MainLayout>
}
