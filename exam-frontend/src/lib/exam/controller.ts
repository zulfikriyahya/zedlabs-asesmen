// src/lib/exam/controller.ts
import { db } from '@/lib/db/schema';
import type { Exam, ExamState } from '@/types/exam';
import type { Question } from '@/types/question';
import type { ExamAnswer } from '@/types/answer';

export class ExamController {
  private exam: Exam;
  private questions: Question[];
  private attemptId: number;
  private currentQuestionIndex: number = 0;
  private answers: Map<number, ExamAnswer> = new Map();
  private flags: Set<number> = new Set();

  constructor(exam: Exam, questions: Question[], attemptId: number) {
    this.exam = exam;
    this.questions = questions;
    this.attemptId = attemptId;
  }

  // Initialize and load saved data
  async loadState(): Promise<void> {
    // 1. Load transient state (navigation, flags)
    const state = await db.exam_states.get(this.attemptId);
    
    if (state) {
      this.currentQuestionIndex = state.current_question_index;
      this.flags = new Set(state.flags);
    }
    
    // 2. Load answers (source of truth)
    const savedAnswers = await db.exam_answers
      .where('attempt_id')
      .equals(this.attemptId)
      .toArray();
    
    savedAnswers.forEach(answer => {
      this.answers.set(answer.question_id, answer);
    });
  }

  async start(): Promise<void> {
    await this.saveState();
  }

  // Persist current state to IndexedDB
  async saveState(): Promise<void> {
    // Convert Map to Object for storage
    const answersObj: Record<number, any> = {};
    this.answers.forEach((answer, questionId) => {
      answersObj[questionId] = answer;
    });

    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: this.currentQuestionIndex,
      time_remaining_seconds: 0, // Managed by TimerController usually, but good to snapshot
      started_at: new Date(), // Should be original start time
      paused_at: undefined,
      answers: answersObj,
      flags: Array.from(this.flags),
    };

    await db.exam_states.put(state);
  }

  // Navigation
  getCurrentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  getQuestions(): Question[] {
    return this.questions;
  }

  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndex;
  }

  getTotalQuestions(): number {
    return this.questions.length;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.saveState();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.saveState();
    }
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      this.saveState();
    }
  }

  // Answering
  saveAnswer(questionId: number, answerData: Partial<ExamAnswer>): void {
    const existing = this.answers.get(questionId) || {};
    
    const fullAnswer: ExamAnswer = {
      attempt_id: this.attemptId,
      question_id: questionId,
      answered_at: new Date(),
      synced: false,
      ...existing,
      ...answerData
    } as ExamAnswer;

    this.answers.set(questionId, fullAnswer);
    
    // Also save to persistent answer table immediately for safety
    db.exam_answers.put(fullAnswer);
    
    this.saveState();
  }

  getAnswer(questionId: number): ExamAnswer | undefined {
    return this.answers.get(questionId);
  }

  getAnswers(): ExamAnswer[] {
    return Array.from(this.answers.values());
  }

  // Flagging
  toggleFlag(questionId: number): void {
    if (this.flags.has(questionId)) {
      this.flags.delete(questionId);
    } else {
      this.flags.add(questionId);
    }
    this.saveState();
  }

  isFlagged(questionId: number): boolean {
    return this.flags.has(questionId);
  }

  // Stats
  getAnsweredCount(): number {
    return this.answers.size;
  }

  isAnswered(questionId: number): boolean {
    return this.answers.has(questionId);
  }

  getAttemptId(): number {
    return this.attemptId;
  }
}