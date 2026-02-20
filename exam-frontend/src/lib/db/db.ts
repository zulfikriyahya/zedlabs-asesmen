import Dexie, { type Table } from 'dexie';
import { DB_NAME, DB_VERSION, DB_SCHEMA } from './schema';
import type { StoredExamPackage } from './schema';
import type { LocalAnswer } from '@/types/answer';
import type { LocalActivityLog } from '@/types/activity';
import type { LocalSyncItem } from '@/types/sync';
import type { LocalMediaBlob } from '@/types/media';

export class ExamDatabase extends Dexie {
  examPackages!: Table<StoredExamPackage, string>; // PK: sessionId
  answers!: Table<LocalAnswer, number>; // PK: ++id
  activityLogs!: Table<LocalActivityLog, number>;
  syncQueue!: Table<LocalSyncItem, number>;
  mediaBlobs!: Table<LocalMediaBlob, number>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores(DB_SCHEMA);
  }
}

// Singleton — satu instance per tab
let _db: ExamDatabase | null = null;

export function getDb(): ExamDatabase {
  if (!_db) _db = new ExamDatabase();
  return _db;
}

// Untuk test teardown
export async function closeDb(): Promise<void> {
  if (_db) {
    _db.close();
    _db = null;
  }
}
