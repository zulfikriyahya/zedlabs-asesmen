'use client';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/stores/ui.store';
import { useSyncStatus } from '@/hooks/use-sync-status';
import { clsx } from 'clsx';

export function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebar, theme, setTheme } = useUiStore();
  const { isOnline, pendingCount } = useSyncStatus();

  return (
    <header className="flex h-16 items-center justify-between border-b border-base-300 bg-base-100 px-4">
      {/* Hamburger */}
      <button className="btn btn-square btn-ghost btn-sm" onClick={toggleSidebar}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* Online/offline indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={clsx(
              'h-2 w-2 rounded-full',
              isOnline ? 'bg-success' : 'animate-pulse bg-error',
            )}
          />
          <span className="hidden text-base-content/60 sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Pending sync count */}
        {pendingCount > 0 && (
          <div className="badge badge-warning badge-sm gap-1">
            <span className="loading loading-spinner loading-xs" />
            {pendingCount} pending
          </div>
        )}

        {/* Theme toggle */}
        <button
          className="btn btn-square btn-ghost btn-sm"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="Toggle tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User menu */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
              <div className="avatar placeholder">
                <div className="w-7 rounded-full bg-primary text-primary-content">
                  <span className="text-xs">{user.username[0]?.toUpperCase()}</span>
                </div>
              </div>
              <span className="hidden text-sm sm:inline">{user.username}</span>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-50 mt-2 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
            >
              <li className="menu-title text-xs">{user.email}</li>
              <li>
                <a href="/siswa/profile">Profil Saya</a>
              </li>
              <li>
                <button onClick={logout} className="text-error">
                  Keluar
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
