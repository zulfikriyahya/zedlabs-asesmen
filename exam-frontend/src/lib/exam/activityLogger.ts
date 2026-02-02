// src/lib/exam/activityLogger.ts
import { db } from '@/lib/db/schema';
import type { ActivityLog, ActivityEventType } from '@/types/activity';

export class ActivityLogger {
  private attemptId: number;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  async log(eventType: ActivityEventType, eventData?: any): Promise<void> {
    const log: ActivityLog = {
      attempt_id: this.attemptId,
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date(),
      synced: false,
    };

    await db.activity_logs.add(log);
  }

  async getLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .sortBy('timestamp');
  }

  async getUnsyncedLogs(): Promise<ActivityLog[]> {
    return await db.activity_logs
      .where('attempt_id')
      .equals(this.attemptId)
      .and(log => !log.synced)
      .sortBy('timestamp');
  }

  async markSynced(logIds: number[]): Promise<void> {
    for (const id of logIds) {
      await db.activity_logs.update(id, { synced: true });
    }
  }
}