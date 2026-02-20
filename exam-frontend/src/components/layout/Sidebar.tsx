'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useUiStore } from '@/stores/ui.store'
import type { UserRole } from '@/types/common'

interface NavItem {
  href: string
  label: string
  icon: string
}

const ICONS: Record<string, string> = {
  grid: '⊞', 'file-text': '📄', 'book-open': '📖', 'check-circle': '✅',
  'bar-chart': '📊', home: '🏠', calendar: '📅', users: '👥',
  monitor: '🖥', user: '👤', shield: '🛡', settings: '⚙',
}

interface SidebarProps {
  navItems: NavItem[]
  role: UserRole
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname()
  const { isSidebarOpen } = useUiStore()

  return (
    <aside className={clsx(
      'flex h-full flex-col bg-base-200 transition-all duration-200',
      isSidebarOpen ? 'w-60' : 'w-16',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-base-300">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content font-bold text-sm shrink-0">
          U
        </div>
        {isSidebarOpen && (
          <span className="font-semibold text-sm truncate">Sistem Ujian</span>
        )}
      </div>

      {/* Role badge */}
      {isSidebarOpen && (
        <div className="px-4 py-2">
          <span className="badge badge-primary badge-sm">{role}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-base-content/70 hover:bg-base-300 hover:text-base-content',
              )}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <span className="text-lg shrink-0">{ICONS[item.icon] ?? '•'}</span>
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
