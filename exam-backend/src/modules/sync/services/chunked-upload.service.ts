import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ChunkInfo {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  data: Buffer;
}

export interface AssembleResult {
  buffer: Buffer;
  isComplete: boolean;
}

@Injectable()
export class ChunkedUploadService {
  private readonly logger = new Logger(ChunkedUploadService.name);
  private readonly tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  async saveChunk(info: ChunkInfo): Promise<{ saved: number; total: number }> {
    if (info.chunkIndex >= info.totalChunks) {
      throw new BadRequestException(
        `chunkIndex ${info.chunkIndex} melebihi totalChunks ${info.totalChunks}`,
      );
    }

    const dir = path.join(this.tmpDir, info.fileId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `chunk_${info.chunkIndex}`), info.data);

    const saved = fs.readdirSync(dir).length;
    this.logger.log(
      `Chunk ${info.chunkIndex + 1}/${info.totalChunks} saved — fileId=${info.fileId}`,
    );

    return { saved, total: info.totalChunks };
  }

  isComplete(fileId: string, totalChunks: number): boolean {
    const dir = path.join(this.tmpDir, fileId);
    if (!fs.existsSync(dir)) return false;
    return fs.readdirSync(dir).length >= totalChunks;
  }

  async assemble(fileId: string, totalChunks: number): Promise<Buffer> {
    const dir = path.join(this.tmpDir, fileId);

    // Validasi semua chunk tersedia
    const missing: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      if (!fs.existsSync(path.join(dir, `chunk_${i}`))) missing.push(i);
    }
    if (missing.length > 0) {
      throw new BadRequestException(`Chunk tidak lengkap, missing: [${missing.join(', ')}]`);
    }

    const chunks = Array.from({ length: totalChunks }, (_, i) =>
      fs.readFileSync(path.join(dir, `chunk_${i}`)),
    );
    const assembled = Buffer.concat(chunks);

    // Cleanup temp dir setelah assembly
    fs.rmSync(dir, { recursive: true, force: true });
    this.logger.log(`Assembly selesai — fileId=${fileId}, size=${assembled.length} bytes`);

    return assembled;
  }

  /** Cleanup temp files lebih dari N menit (dipanggil via cron/scheduled task) */
  cleanupStale(maxAgeMinutes = 120): number {
    if (!fs.existsSync(this.tmpDir)) return 0;
    const now = Date.now();
    let removed = 0;
    for (const dir of fs.readdirSync(this.tmpDir)) {
      const fullPath = path.join(this.tmpDir, dir);
      const stat = fs.statSync(fullPath);
      const ageMinutes = (now - stat.mtimeMs) / 60_000;
      if (ageMinutes > maxAgeMinutes) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        removed++;
      }
    }
    if (removed > 0) this.logger.log(`Cleaned up ${removed} stale temp dirs`);
    return removed;
  }
}
