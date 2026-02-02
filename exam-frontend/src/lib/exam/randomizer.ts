import type { Question, QuestionOption } from '@/types/question';

/**
 * Fisher-Yates Shuffle Algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function randomizeQuestions(questions: Question[]): Question[] {
  return shuffleArray(questions);
}

export function randomizeOptions(options: QuestionOption[]): QuestionOption[] {
  return shuffleArray(options);
}

export function prepareExamForStudent(questions: Question[], randomizeQ: boolean, randomizeO: boolean): Question[] {
  let processedQuestions = randomizeQ ? randomizeQuestions(questions) : [...questions];

  if (randomizeO) {
    processedQuestions = processedQuestions.map(q => {
      if (q.type === 'multiple_choice' || q.type === 'multiple_choice_complex') {
        return {
          ...q,
          options: randomizeOptions(q.options)
        };
      }
      return q;
    });
  }

  return processedQuestions;
}