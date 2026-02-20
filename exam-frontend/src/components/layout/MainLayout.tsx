'use client'
import { useAuth } from '@/hooks/use-auth'
import { Loading } from '@/components/ui/Loading'
import { ToastContainer } from '@/components/ui/Toast'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import type { UserRole } from '@/types/common'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface MainLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  role: UserRole
}

export function MainLayout({ children, navItems, role }: MainLayoutProps) {
  const { isLoading } = useAuth()

  if (isLoading) return <Loading fullscreen text="Memuat sesi..." />

  return (
    <div className="flex h-screen overflow-hidden bg-base-100">
      {/* Sidebar */}
      <Sidebar navItems={navItems} role={role} />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>

      <ToastContainer />
    </div>
  )
}
