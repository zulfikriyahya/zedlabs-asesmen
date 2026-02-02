// src/types/activity.ts
export type ActivityEventType =
  | 'exam_started'
  | 'exam_paused'
  | 'exam_resumed'
  | 'exam_submitted'
  | 'question_viewed'
  | 'answer_changed'
  | 'tab_switched'
  | 'fullscreen_exited'
  | 'suspicious_activity'
  | 'media_played'
  | 'media_recorded';

export interface ActivityLog {
  id?: number;
  attempt_id: number;
  event_type: ActivityEventType;
  event_data?: any;
  timestamp: Date;
  synced: boolean;
}

export interface SuspiciousActivity {
  type: 'copy_attempt' | 'paste_attempt' | 'screenshot' | 'tab_switch' | 'fullscreen_exit';
  timestamp: Date;
  details?: string;
}