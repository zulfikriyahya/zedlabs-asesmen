import { MainLayout } from '@/components/layout/MainLayout'

const PENGAWAS_NAV = [
  { href: '/pengawas/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/pengawas/monitoring/live', label: 'Live Monitor', icon: 'monitor' },
]

export default function PengawasLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={PENGAWAS_NAV} role="SUPERVISOR">{children}</MainLayout>
}
