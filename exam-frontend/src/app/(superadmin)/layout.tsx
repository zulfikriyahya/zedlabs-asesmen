import { MainLayout } from '@/components/layout/MainLayout'

const SA_NAV = [
  { href: '/superadmin/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/superadmin/schools', label: 'Sekolah', icon: 'home' },
  { href: '/superadmin/users', label: 'Pengguna', icon: 'users' },
  { href: '/superadmin/audit-logs', label: 'Audit Log', icon: 'shield' },
  { href: '/superadmin/settings', label: 'Pengaturan', icon: 'settings' },
]

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout navItems={SA_NAV} role="SUPERADMIN">{children}</MainLayout>
}
