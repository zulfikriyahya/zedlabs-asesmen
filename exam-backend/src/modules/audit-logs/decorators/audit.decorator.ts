import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

export interface AuditActionMeta {
  action: string;
  entityType: string;
}

export const AuditAction = (action: string, entityType: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, entityType } satisfies AuditActionMeta);

/** Konstanta aksi — gunakan ini agar tidak ada typo di berbagai controller */
export const AuditActions = {
  // Auth
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  // Exam
  START_EXAM: 'START_EXAM',
  SUBMIT_EXAM: 'SUBMIT_EXAM',
  // Grading
  GRADE_ANSWER: 'GRADE_ANSWER',
  PUBLISH_RESULT: 'PUBLISH_RESULT',
  // Session
  ACTIVATE_SESSION: 'ACTIVATE_SESSION',
  // Users
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DEACTIVATE_USER: 'DEACTIVATE_USER',
} as const;
