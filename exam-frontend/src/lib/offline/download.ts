// src/lib/offline/download.ts
import { apiClient } from '@/lib/api/client';
import { db } from '@/lib/db/schema';
import { encrypt } from '@/lib/db/encryption';
import { generateChecksum, sha256ArrayBuffer } from './checksum';
import type { DownloadProgress } from '@/types/sync';
import type { MediaFile } from '@/types/exam';

export async function downloadExam(
  examId: number,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  try {
    onProgress?.({
      phase: 'preparing',
      current: 0,
      total: 1,
      percentage: 0,
    });

    const prepareResponse = await apiClient.post(`/student/exams/${examId}/prepare`);
    const { attempt_id } = prepareResponse.data;

    onProgress?.({
      phase: 'exam_data',
      current: 0,
      total: 1,
      percentage: 10,
    });

    const downloadResponse = await apiClient.get(`/student/exams/${examId}/download`);
    const { exam, questions, media_files, checksum } = downloadResponse.data;

    const calculatedChecksum = generateChecksum({ exam, questions });
    if (calculatedChecksum !== checksum) {
      throw new Error('Checksum validation failed');
    }

    const encryptedExam = encrypt(JSON.stringify(exam));
    const encryptedQuestions = encrypt(JSON.stringify(questions));

    await db.downloaded_exams.put({
      exam_id: examId,
      attempt_id: attempt_id,
      exam_data: encryptedExam,
      questions: encryptedQuestions,
      media_files: media_files,
      checksum: checksum,
      downloaded_at: new Date(),
      expires_at: new Date(exam.window_end_at),
    });

    onProgress?.({
      phase: 'media_files',
      current: 0,
      total: media_files.length,
      percentage: 20,
    });

    for (let i = 0; i < media_files.length; i++) {
      const mediaFile = media_files[i];

      onProgress?.({
        phase: 'media_files',
        current: i + 1,
        total: media_files.length,
        currentFile: mediaFile.url,
        percentage: 20 + ((i + 1) / media_files.length) * 70,
      });

      await downloadMediaFile(mediaFile);
    }

    onProgress?.({
      phase: 'complete',
      current: media_files.length,
      total: media_files.length,
      percentage: 100,
    });
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

async function downloadMediaFile(mediaFile: MediaFile): Promise<void> {
  try {
    const response = await fetch(mediaFile.url);
    const blob = await response.blob();

    const arrayBuffer = await blob.arrayBuffer();
    const calculatedChecksum = await sha256ArrayBuffer(arrayBuffer);

    if (calculatedChecksum !== mediaFile.checksum) {
      throw new Error(`Checksum mismatch for ${mediaFile.url}`);
    }

    await db.media_files.put({
      id: mediaFile.id,
      url: mediaFile.url,
      local_path: `blob:${mediaFile.id}`,
      checksum: mediaFile.checksum,
      size: blob.size,
      type: mediaFile.type,
      downloaded: true,
    });
  } catch (error) {
    console.error(`Failed to download ${mediaFile.url}:`, error);
    throw error;
  }
}

export async function deleteDownloadedExam(examId: number): Promise<void> {
  await db.downloaded_exams.where('exam_id').equals(examId).delete();
  
  const mediaFiles = await db.media_files.toArray();
  for (const file of mediaFiles) {
    await db.media_files.delete(file.id);
  }
}