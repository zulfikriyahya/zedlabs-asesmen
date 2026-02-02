// src/types/exam.ts
export interface Exam {
  id: number;
  school_id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  randomize_questions: boolean;
  randomize_options: boolean;
  show_results: boolean;
  allow_review: boolean;
  max_attempts: number;
  window_start_at: string;
  window_end_at: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  id: number;
  exam_id: number;
  name: string;
  start_time: string;
  end_time: string;
  room_id?: number;
  proctors: number[];
  created_at: string;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  user_id: number;
  session_id?: number;
  started_at: string;
  submitted_at?: string;
  time_remaining_seconds: number;
  status: 'not_started' | 'in_progress' | 'paused' | 'submitted' | 'graded';
  score?: number;
  total_score: number;
  device_fingerprint: string;
  ip_address?: string;
}

export interface ExamState {
  attempt_id: number;
  current_question_index: number;
  time_remaining_seconds: number;
  started_at: Date;
  paused_at?: Date;
  pause_reason?: string;
  answers: Record<number, any>; // question_id => answer
  flags: number[]; // question_id marked for review
}

export interface DownloadedExam {
  exam_id: number;
  attempt_id: number;
  exam_data: string; // Encrypted JSON
  questions: string; // Encrypted JSON
  media_files: MediaFile[];
  checksum: string;
  downloaded_at: Date;
  expires_at: Date;
}

export interface MediaFile {
  id: string;
  url: string;
  local_path: string;
  checksum: string;
  size: number;
  type: 'image' | 'audio' | 'video';
  downloaded: boolean;
}