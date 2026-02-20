import { MainLayout } from '@/components/layout/MainLayout'

const OP_NAV = [
  { href: '/operator/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/operator/ruang', label: 'Ruang Ujian', icon: 'home' },
  { href: '/operator/sesi', label: 'Sesi Ujian', icon: 'calendar' },
  { href: '/operator/peserta', label: 'Peserta', icon: 'users' },
  { href: '/operator/laporan', label: 'Laporan', icon: 'file-text' },
]

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={OP_NAV} role="OPERATOR">{children}</MainLayout>
}
