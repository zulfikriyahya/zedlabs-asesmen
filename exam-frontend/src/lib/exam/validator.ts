import type { Question } from '@/types/question';
import type { ExamAnswer } from '@/types/answer';

export function validateAnswer(question: Question, answer: any): boolean {
  if (!answer) return false;

  switch (question.type) {
    case 'multiple_choice':
      return typeof answer === 'number'; // Expect option ID
    
    case 'multiple_choice_complex':
      return Array.isArray(answer) && answer.length > 0;
    
    case 'true_false':
      return typeof answer === 'boolean';
    
    case 'short_answer':
      return typeof answer === 'string' && answer.trim().length > 0;
    
    case 'essay':
      // Basic check, essay usually needs manual grading or just check if not empty
      return typeof answer === 'string' && answer.trim().length > 0;
      
    case 'matching':
      // Check if all pairs are matched (optional strictness)
      return typeof answer === 'object' && Object.keys(answer).length > 0;
      
    default:
      return false;
  }
}

export function isExamComplete(questions: Question[], answers: Record<number, ExamAnswer>): boolean {
  return questions.every(q => {
    const ans = answers[q.id];
    // Check if answer exists and has content
    // Note: This is a simple check. Depending on requirements, 
    // we might allow submitting with empty answers.
    return !!ans; 
  });
}