import { db } from '@/lib/db/schema';
import type { ExamState } from '@/types/exam';

export class ExamStateManager {
  private attemptId: number;

  constructor(attemptId: number) {
    this.attemptId = attemptId;
  }

  async saveState(
    currentQuestionIndex: number, 
    timeRemaining: number, 
    answers: Record<number, any>, 
    flags: number[]
  ) {
    const state: ExamState = {
      attempt_id: this.attemptId,
      current_question_index: currentQuestionIndex,
      time_remaining_seconds: timeRemaining,
      started_at: new Date(), // Should be original start time ideally
      answers,
      flags
    };

    await db.exam_states.put(state);
  }

  async loadState(): Promise<ExamState | undefined> {
    return await db.exam_states.get(this.attemptId);
  }

  async clearState() {
    return await db.exam_states.delete(this.attemptId);
  }
}