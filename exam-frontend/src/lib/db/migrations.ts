/**
 * Dexie version migrations.
 * Setiap upgrade() dipanggil saat DB_VERSION naik.
 * Jangan hapus entry lama — Dexie butuh chain lengkap.
 */

import type { ExamDatabase } from './db'

export function applyMigrations(db: ExamDatabase): void {
  // v1 → initial schema (didefinisikan di schema.ts via version(1).stores())
  // Tidak ada migration logic di v1

  // Contoh v2 di masa depan:
  // db.version(2).stores({ ...DB_SCHEMA, newTable: '++id, field' }).upgrade(tx => {
  //   return tx.table('answers').toCollection().modify(ans => { ans.newField = 'default' })
  // })
}
