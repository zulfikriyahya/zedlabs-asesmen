'use client';
import { useAuthStore } from '@/stores/auth.store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Profil Saya</h1>
      <Card>
        <div className="mb-4 flex items-center gap-4">
          <div className="avatar placeholder">
            <div className="w-16 rounded-full bg-primary text-primary-content">
              <span className="text-xl">{user.username[0]?.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <p className="text-lg font-bold">{user.username}</p>
            <p className="text-sm text-base-content/60">{user.email}</p>
            <Badge variant="primary" size="xs" className="mt-1">
              {user.role}
            </Badge>
          </div>
        </div>
        <div className="divider" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-base-content/60">ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Status</span>
            <Badge variant={user.isActive ? 'success' : 'error'} size="xs">
              {user.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
