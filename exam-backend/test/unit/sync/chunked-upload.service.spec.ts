import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ChunkedUploadService } from '../../../src/modules/sync/services/chunked-upload.service';

describe('ChunkedUploadService', () => {
  let svc: ChunkedUploadService;
  const fileId = `test-${Date.now()}`;
  const tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  beforeEach(() => {
    svc = new ChunkedUploadService();
  });

  afterEach(() => {
    const dir = path.join(tmpDir, fileId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
  });

  it('saveChunk — menyimpan chunk dan return progress', async () => {
    const result = await svc.saveChunk({
      fileId,
      chunkIndex: 0,
      totalChunks: 3,
      data: Buffer.from('hello'),
    });
    expect(result.saved).toBe(1);
    expect(result.total).toBe(3);
  });

  it('saveChunk — tolak chunkIndex >= totalChunks', async () => {
    await expect(
      svc.saveChunk({ fileId, chunkIndex: 3, totalChunks: 3, data: Buffer.from('x') }),
    ).rejects.toThrow(BadRequestException);
  });

  it('isComplete — false jika belum semua chunk ada', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('a') });
    expect(svc.isComplete(fileId, 2)).toBe(false);
  });

  it('isComplete — true jika semua chunk ada', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('ab') });
    await svc.saveChunk({ fileId, chunkIndex: 1, totalChunks: 2, data: Buffer.from('cd') });
    expect(svc.isComplete(fileId, 2)).toBe(true);
  });

  it('assemble — menggabungkan chunk secara berurutan', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 2, data: Buffer.from('Hello') });
    await svc.saveChunk({ fileId, chunkIndex: 1, totalChunks: 2, data: Buffer.from(' World') });
    const result = await svc.assemble(fileId, 2);
    expect(result.toString()).toBe('Hello World');
    // temp dir harus sudah dihapus
    expect(fs.existsSync(path.join(tmpDir, fileId))).toBe(false);
  });

  it('assemble — throw jika ada chunk yang missing', async () => {
    await svc.saveChunk({ fileId, chunkIndex: 0, totalChunks: 3, data: Buffer.from('x') });
    // chunk 1 dan 2 tidak dikirim
    await expect(svc.assemble(fileId, 3)).rejects.toThrow(BadRequestException);
  });

  it('cleanupStale — menghapus dir yang sudah terlalu lama', async () => {
    // Buat dir dummy dengan mtime lama
    const staleDir = path.join(tmpDir, `stale-${Date.now()}`);
    fs.mkdirSync(staleDir, { recursive: true });
    // Set mtime ke 3 jam lalu
    const oldTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
    fs.utimesSync(staleDir, oldTime, oldTime);

    const removed = svc.cleanupStale(120);
    expect(removed).toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(staleDir)).toBe(false);
  });
});
