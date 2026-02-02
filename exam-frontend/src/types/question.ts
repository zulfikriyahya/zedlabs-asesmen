// src/types/question.ts
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_choice_complex'
  | 'true_false'
  | 'matching'
  | 'short_answer'
  | 'essay';

export type MediaType = 'image' | 'audio' | 'video';

export interface BaseQuestion {
  id: number;
  exam_id: number;
  type: QuestionType;
  question_text: string;
  question_html?: string;
  points: number;
  order_number: number;
  media_url?: string;
  media_type?: MediaType;
  media_repeatable?: boolean;
  media_max_plays?: number;
  created_at: string;
  updated_at: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: QuestionOption[];
}

export interface MultipleChoiceComplexQuestion extends BaseQuestion {
  type: 'multiple_choice_complex';
  options: QuestionOption[];
  min_selections?: number;
  max_selections?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correct_answer: boolean;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  max_length?: number;
  case_sensitive?: boolean;
  correct_answers?: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  min_words?: number;
  max_words?: number;
  require_media?: boolean;
  media_type?: 'audio' | 'video';
  max_media_duration?: number; // in seconds
}

export type Question =
  | MultipleChoiceQuestion
  | MultipleChoiceComplexQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | ShortAnswerQuestion
  | EssayQuestion;

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  option_html?: string;
  is_correct: boolean;
  order_number: number;
  media_url?: string;
}

export interface MatchingPair {
  id: number;
  question_id: number;
  left_text: string;
  right_text: string;
  left_media_url?: string;
  right_media_url?: string;
  order_number: number;
}

export interface QuestionTag {
  id: number;
  name: string;
  color?: string;
}