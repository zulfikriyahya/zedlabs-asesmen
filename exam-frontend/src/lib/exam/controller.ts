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

  async start(): Promise<void> {
    await this.saveState();
  }

  async loadState(): Promise<void> {
    const state = await db.exam_states.get(this.attemptId);
    
    if (state) {
      this.currentQuestionIndex = state.current_question_index;
      this.flags = new Set(state.flags);
      
      for (const [questionId, answer] of Object.entries(state.answers)) {
        this.answers.set(parseInt(questionId), answer as ExamAnswer);
      }
    }
    
    const savedAnswers = await db.exam_answers
      .where('attempt_id')
      .equals(this.attemptId)
      .toArray();
    
    savedAnswers.forEach(answer => {
      this.answers.set(answer.question_id, answer);
    });
  }

  async saveState(): Promise<void> {
    const answersObj: Record<number, any> = {};
    this.answers.forEach((answer, questionId) => {
      answersObj[questionId] = answer;
    });

    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: this.currentQuestionIndex,
      time_remaining_seconds: 0,
      started_at: new Date(),
      answers: answersObj,
      flags: Array.from(this.flags),
    };

    await db.exam_states.put(state);
  }

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

  saveAnswer(questionId: number, answer: ExamAnswer): void {
    this.answers.set(questionId, answer);
    this.saveState();
  }

  getAnswer(questionId: number): ExamAnswer | undefined {
    return this.answers.get(questionId);
  }

  getAnswers(): ExamAnswer[] {
    return Array.from(this.answers.values());
  }

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

  getAnsweredCount(): number {
    return this.answers.size;
  }

  isAnswered(questionId: number): boolean {
    return this.answers.has(questionId);
  }

  getAttemptId(): number {
    return this.attemptId;
  }

  getExam(): Exam {
    return this.exam;
  }
}