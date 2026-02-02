import { db } from './schema';

// Helper functions to interact with Dexie DB safely
export async function saveExamState(attemptId: number, state: any) {
  try {
    await db.exam_states.put({ ...state, attempt_id: attemptId });
  } catch (error) {
    console.error('Failed to save exam state to IndexedDB', error);
  }
}

export async function getExamState(attemptId: number) {
  return await db.exam_states.get(attemptId);
}

export async function clearExamState(attemptId: number) {
  return await db.exam_states.delete(attemptId);
}