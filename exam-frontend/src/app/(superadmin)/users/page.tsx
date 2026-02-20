'use client'
import { useEffect, useState, useCallback } from 'react'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { User } from '@/types/user'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils/format'

const ROLE_VARIANT: Record<string, 'primary' | 'secondary' | 'accent' | 'info' | 'warning' | 'success'> = {
  SUPERADMIN: 'primary', ADMIN: 'secondary', TEACHER: 'accent',
  OPERATOR: 'info', SUPERVISOR: 'warning', STUDENT: 'success',
}

export default function UsersPage() {
  const { success, error: toastError } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      params.set('limit', '50')
      const res = await apiGet<{ data: User[] }>(`users?${params}`)
      setUsers(res.data)
    } catch (e) { toastError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [search, role])

  useEffect(() => { void load() }, [load])

  const toggleActive = async (u: User) => {
    try {
      await apiPatch(`users/${u.id}`, { isActive: !u.isActive })
      success(`${u.username} ${u.isActive ? 'dinonaktifkan' : 'diaktifkan'}`)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
  }

  const ROLES = [
    { value: '', label: 'Semua Role' },
    ...['SUPERADMIN', 'ADMIN', 'TEACHER', 'OPERATOR', 'SUPERVISOR', 'STUDENT'].map(r => ({ value: r, label: r })),
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48">
          <Input placeholder="Cari username/email..." value={search} onChange={e => setSearch(e.target.value)} inputSize="sm" />
        </div>
        <div className="w-36">
          <Select options={ROLES} value={role} onChange={e => setRole(e.target.value)} />
        </div>
      </div>

      <Table
        data={users}
        keyExtractor={u => u.id}
        loading={loading}
        emptyText="Tidak ada pengguna"
        zebra
        columns={[
          {
            key: 'user', header: 'Pengguna',
            render: u => (
              <div>
                <p className="font-medium text-sm">{u.username}</p>
                <p className="text-xs text-base-content/50">{u.email}</p>
              </div>
            ),
          },
          { key: 'role', header: 'Role', className: 'w-28', render: u => <Badge variant={ROLE_VARIANT[u.role] ?? 'neutral'} size="sm">{u.role}</Badge> },
          { key: 'status', header: 'Status', className: 'w-24', render: u => <Badge variant={u.isActive ? 'success' : 'error'} size="xs">{u.isActive ? 'Aktif' : 'Nonaktif'}</Badge> },
          { key: 'created', header: 'Bergabung', className: 'w-32', render: u => <span className="text-xs text-base-content/60">{formatDate(u.createdAt)}</span> },
          {
            key: 'actions', header: '', className: 'w-32',
            render: u => (
              <Button size="xs" variant={u.isActive ? 'error' : 'success'} outline onClick={() => void toggleActive(u)}>
                {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
