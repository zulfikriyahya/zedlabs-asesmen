// src/lib/exam/autoSave.ts
import { db } from '@/lib/db/schema';
import type { ExamAnswer } from '@/types/answer';

export class AutoSaveManager {
  private attemptId: number;
  private pendingChanges: Map<number, ExamAnswer> = new Map();
  private saveInterval: number | null = null;
  private isSaving: boolean = false;
  
  // Callback untuk update UI status
  private onStatusChange: (status: 'idle' | 'saving' | 'saved' | 'error') => void;

  constructor(attemptId: number, onStatusChange: (status: any) => void) {
    this.attemptId = attemptId;
    this.onStatusChange = onStatusChange;
  }

  // Queue changes (dipanggil setiap user ngetik/pilih jawaban)
  enqueue(questionId: number, answer: ExamAnswer) {
    this.pendingChanges.set(questionId, answer);
    this.onStatusChange('idle'); // Status "Belum tersimpan" (bisa diubah logicnya)
  }

  start(intervalMs: number = 30000) {
    this.saveInterval = window.setInterval(() => {
      this.save();
    }, intervalMs);
  }

  stop() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
    // Force save on stop
    this.save();
  }

  async save() {
    if (this.pendingChanges.size === 0 || this.isSaving) return;

    this.isSaving = true;
    this.onStatusChange('saving');

    try {
      // Ambil snapshot data yang akan disimpan
      const changesToSave = Array.from(this.pendingChanges.values());
      
      // 1. Simpan ke IndexedDB (Critical)
      await db.exam_answers.bulkPut(changesToSave);
      
      // 2. Clear pending map (hanya yang sudah diambil)
      changesToSave.forEach(ans => {
        // Cek apakah ada perubahan baru selama proses save
        const currentPending = this.pendingChanges.get(ans.question_id!);
        if (currentPending === ans) {
          this.pendingChanges.delete(ans.question_id!);
        }
      });

      this.onStatusChange('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.onStatusChange('error');
    } finally {
      this.isSaving = false;
    }
  }
}