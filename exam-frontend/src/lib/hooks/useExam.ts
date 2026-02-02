import { useStore } from '@nanostores/react';
import { $examStore, nextQuestion, previousQuestion, goToQuestion, setAnswer } from '@/stores/exam';
import { $answersStore } from '@/stores/answers';

export function useExam() {
  const examState = useStore($examStore);
  const answersState = useStore($answersStore);

  return {
    exam: examState.exam,
    currentQuestion: examState.questions[examState.currentQuestionIndex],
    currentIndex: examState.currentQuestionIndex,
    totalQuestions: examState.questions.length,
    answers: answersState.answers,
    
    // Actions
    nextQuestion,
    previousQuestion,
    goToQuestion,
    setAnswer: (questionId: number, value: any) => {
      // Logic wrapper to update store
      // Implementation depends on answer structure
    }
  };
}