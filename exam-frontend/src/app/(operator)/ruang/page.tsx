'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client'
import { parseErrorMessage } from '@/lib/utils/error'
import type { ExamRoom } from '@/types/exam'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Confirm } from '@/components/ui/Confirm'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'

interface RoomForm { name: string; capacity?: number }

export default function RuangPage() {
  const { success, error: toastError } = useToast()
  const [rooms, setRooms] = useState<ExamRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ExamRoom | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExamRoom | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RoomForm>()

  const load = useCallback(async () => {
    setLoading(true)
    try { setRooms(await apiGet<ExamRoom[]>('exam-rooms')) }
    catch (e) { toastError(parseErrorMessage(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const openCreate = () => { setEditTarget(null); reset({ name: '', capacity: undefined }); setModalOpen(true) }
  const openEdit = (r: ExamRoom) => { setEditTarget(r); reset({ name: r.name, capacity: r.capacity ?? undefined }); setModalOpen(true) }

  const onSubmit = async (data: RoomForm) => {
    try {
      if (editTarget) { await apiPatch(`exam-rooms/${editTarget.id}`, data); success('Ruang diperbarui') }
      else { await apiPost('exam-rooms', data); success('Ruang dibuat') }
      setModalOpen(false)
      void load()
    } catch (e) { toastError(parseErrorMessage(e)) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await apiDelete(`exam-rooms/${deleteTarget.id}`); success('Ruang dihapus'); setDeleteTarget(null); void load() }
    catch (e) { toastError(parseErrorMessage(e)) }
    finally { setDeleting(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ruang Ujian</h1>
        <Button size="sm" onClick={openCreate}>+ Tambah Ruang</Button>
      </div>

      <Table
        data={rooms}
        keyExtractor={r => r.id}
        loading={loading}
        emptyText="Belum ada ruang ujian"
        columns={[
          { key: 'name', header: 'Nama Ruang', render: r => <span className="font-medium">{r.name}</span> },
          { key: 'cap', header: 'Kapasitas', className: 'w-28 text-center', render: r => <span>{r.capacity ?? '—'} orang</span> },
          {
            key: 'actions', header: '', className: 'w-28',
            render: r => (
              <div className="flex gap-1 justify-end">
                <Button size="xs" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                <Button size="xs" variant="ghost" className="text-error" onClick={() => setDeleteTarget(r)}>Hapus</Button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Ruang' : 'Tambah Ruang'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nama Ruang" placeholder="Lab Komputer 1" error={errors.name?.message} {...register('name', { required: 'Wajib diisi' })} />
          <Input label="Kapasitas (opsional)" type="number" placeholder="30" {...register('capacity', { valueAsNumber: true })} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" loading={isSubmitting}>Simpan</Button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Ruang?"
        message={`Ruang "${deleteTarget?.name}" akan dihapus permanen.`}
        variant="error"
        confirmLabel="Hapus"
        loading={deleting}
      />
    </div>
  )
}
