// src/stores/answers.ts
import { atom } from 'nanostores';
import { db } from '@/lib/db/schema';
import type { ExamAnswer } from '@/types/answer';

interface AnswersState {
  answers: Record<number, ExamAnswer>;
  isDirty: boolean;
  lastSaved: Date | null;
}

const initialState: AnswersState = {
  answers: {},
  isDirty: false,
  lastSaved: null,
};

export const $answersStore = atom<AnswersState>(initialState);

export function setAnswer(questionId: number, answer: ExamAnswer): void {
  const state = $answersStore.get();
  $answersStore.set({
    ...state,
    answers: {
      ...state.answers,
      [questionId]: answer,
    },
    isDirty: true,
  });
}

export function getAnswer(questionId: number): ExamAnswer | undefined {
  return $answersStore.get().answers[questionId];
}

export function getAllAnswers(): ExamAnswer[] {
  return Object.values($answersStore.get().answers);
}

export function setAnswers(answers: Record<number, ExamAnswer>): void {
  $answersStore.set({
    ...$answersStore.get(),
    answers,
  });
}

export async function loadAnswers(attemptId: number): Promise<void> {
  const answers = await db.exam_answers
    .where('attempt_id')
    .equals(attemptId)
    .toArray();
  
  const answersMap: Record<number, ExamAnswer> = {};
  answers.forEach(answer => {
    answersMap[answer.question_id] = answer;
  });
  
  $answersStore.set({
    answers: answersMap,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export async function saveAnswers(attemptId: number): Promise<void> {
  const state = $answersStore.get();
  
  if (!state.isDirty) {
    return;
  }
  
  const answers = Object.values(state.answers);
  
  await db.exam_answers.bulkPut(answers);
  
  $answersStore.set({
    ...state,
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function markSaved(): void {
  $answersStore.set({
    ...$answersStore.get(),
    isDirty: false,
    lastSaved: new Date(),
  });
}

export function clearAnswers(): void {
  $answersStore.set(initialState);
}