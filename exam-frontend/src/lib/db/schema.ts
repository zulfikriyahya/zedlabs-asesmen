// src/lib/db/schema.ts
import Dexie, { Table } from 'dexie';
import type { School, User } from '@/types/user';
import type { DownloadedExam, MediaFile } from '@/types/exam';
import type { ExamAnswer } from '@/types/answer';
import type { ActivityLog } from '@/types/activity';
import type { SyncQueueItem } from '@/types/sync';
import type { ExamState } from '@/types/exam';

// Database class
export class ExamDatabase extends Dexie {
  schools!: Table<School, number>;
  users!: Table<User, number>;
  downloaded_exams!: Table<DownloadedExam, number>;
  media_files!: Table<MediaFile, string>;
  exam_answers!: Table<ExamAnswer, number>;
  activity_logs!: Table<ActivityLog, number>;
  sync_queue!: Table<SyncQueueItem, number>;
  exam_states!: Table<ExamState, number>;

  constructor() {
    super('ExamDB');

    this.version(1).stores({
      schools: 'id, subdomain',
      users: 'id, school_id, username',
      downloaded_exams: 'exam_id, attempt_id, downloaded_at',
      media_files: 'id, url, downloaded',
      exam_answers: '++id, attempt_id, question_id, synced',
      activity_logs: '++id, attempt_id, timestamp, synced',
      sync_queue: '++id, attempt_id, type, status, priority',
      exam_states: 'attempt_id',
    });
  }
}

export const db = new ExamDatabase();