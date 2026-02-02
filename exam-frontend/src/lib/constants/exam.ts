export const EXAM_STATUS = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MULTIPLE_CHOICE_COMPLEX: 'multiple_choice_complex',
  TRUE_FALSE: 'true_false',
  MATCHING: 'matching',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
} as const;

export const MAX_EXAM_DURATION_MINUTES = 300; // 5 hours
export const MIN_EXAM_DURATION_MINUTES = 10;