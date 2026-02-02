// Helper logic for navigation state
export function calculateProgress(total: number, answered: number): number {
  if (total === 0) return 0;
  return Math.round((answered / total) * 100);
}

export function getUnansweredQuestions(questions: any[], answers: Record<number, any>): number[] {
  return questions
    .filter(q => !answers[q.id])
    .map(q => q.id);
}