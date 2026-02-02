// src/types/answer.ts
export interface BaseAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answered_at: Date;
  synced: boolean;
}

export interface MultipleChoiceAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_id: number;
}

export interface MultipleChoiceComplexAnswer extends BaseAnswer {
  answer_text?: string;
  selected_option_ids: number[];
}

export interface TrueFalseAnswer extends BaseAnswer {
  answer_text?: string;
  selected_value: boolean;
}

export interface MatchingAnswer extends BaseAnswer {
  answer_json: Record<number, number>; // left_id => right_id
}

export interface ShortAnswerAnswer extends BaseAnswer {
  answer_text: string;
}

export interface EssayAnswer extends BaseAnswer {
  answer_text?: string;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answer_media_url?: string;
  answer_media_duration?: number;
}

export type Answer =
  | MultipleChoiceAnswer
  | MultipleChoiceComplexAnswer
  | TrueFalseAnswer
  | MatchingAnswer
  | ShortAnswerAnswer
  | EssayAnswer;

export interface ExamAnswer {
  id?: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_type?: 'audio' | 'video';
  answer_media_blob?: Blob;
  answered_at: Date;
  synced: boolean;
}

export interface GradedAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
  answer_media_url?: string;
  points_earned: number;
  points_possible: number;
  is_correct: boolean;
  graded_by?: number;
  graded_at?: string;
  feedback?: string;
}