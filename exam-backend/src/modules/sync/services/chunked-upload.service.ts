import { BadRequestException, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Redis } from 'ioredis';

// TTL chunk di Redis: 3 jam (cukup untuk upload lambat di jaringan sekolah)
const CHUNK_TTL = 60 * 60 * 3;

export interface ChunkInfo {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  data: Buffer;
}

/**
 * [Fix #4] Chunked upload sekarang pakai Redis sebagai temp storage.
 * Aman di environment multi-instance (PM2 cluster) karena semua instance
 * mengakses Redis yang sama, bukan filesystem lokal masing-masing.
 *
 * Jika Redis tidak tersedia (dev tanpa Redis), fallback ke in-memory Map.
 */
@Injectable()
export class ChunkedUploadService {
  private readonly logger = new Logger(ChunkedUploadService.name);
  // Fallback in-memory untuk dev/test
  private readonly memStore = new Map<string, Buffer>();

  constructor(@Optional() @Inject('REDIS_CLIENT') private readonly redis?: Redis) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private chunkKey(fileId: string, index: number) {
    return `chunk:${fileId}:${index}`;
  }

  private metaKey(fileId: string) {
    return `chunk:${fileId}:meta`;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async saveChunk(info: ChunkInfo): Promise<{ saved: number; total: number }> {
    if (info.chunkIndex >= info.totalChunks) {
      throw new BadRequestException(
        `chunkIndex ${info.chunkIndex} melebihi totalChunks ${info.totalChunks}`,
      );
    }

    if (this.redis) {
      await this.redis.setex(this.chunkKey(info.fileId, info.chunkIndex), CHUNK_TTL, info.data);
      // Increment counter chunk yang tersimpan
      const countKey = this.metaKey(info.fileId);
      await this.redis.incr(countKey);
      await this.redis.expire(countKey, CHUNK_TTL);

      const saved = parseInt((await this.redis.get(countKey)) ?? '0', 10);
      this.logger.log(
        `[Redis] Chunk ${info.chunkIndex + 1}/${info.totalChunks} saved — fileId=${info.fileId}`,
      );
      return { saved, total: info.totalChunks };
    }

    // Fallback in-memory
    this.memStore.set(this.chunkKey(info.fileId, info.chunkIndex), info.data);
    const saved = Array.from(this.memStore.keys()).filter((k) =>
      k.startsWith(`chunk:${info.fileId}:`),
    ).length;
    return { saved, total: info.totalChunks };
  }

  async isComplete(fileId: string, totalChunks: number): Promise<boolean> {
    if (this.redis) {
      const count = parseInt((await this.redis.get(this.metaKey(fileId))) ?? '0', 10);
      return count >= totalChunks;
    }
    const saved = Array.from(this.memStore.keys()).filter(
      (k) => k.startsWith(`chunk:${fileId}:`) && !k.endsWith(':meta'),
    ).length;
    return saved >= totalChunks;
  }

  async assemble(fileId: string, totalChunks: number): Promise<Buffer> {
    const missing: number[] = [];
    const chunks: Buffer[] = [];

    for (let i = 0; i < totalChunks; i++) {
      let buf: Buffer | null = null;

      if (this.redis) {
        const raw = await this.redis.getBuffer(this.chunkKey(fileId, i));
        buf = raw ?? null;
      } else {
        buf = this.memStore.get(this.chunkKey(fileId, i)) ?? null;
      }

      if (!buf) {
        missing.push(i);
      } else {
        chunks.push(buf);
      }
    }

    if (missing.length > 0) {
      throw new BadRequestException(`Chunk tidak lengkap, missing: [${missing.join(', ')}]`);
    }

    const assembled = Buffer.concat(chunks);
    await this.cleanup(fileId, totalChunks);

    this.logger.log(`Assembly selesai — fileId=${fileId}, size=${assembled.length} bytes`);
    return assembled;
  }

  /** Cleanup setelah assembly atau saat scheduled cleanup */
  async cleanup(fileId: string, totalChunks: number): Promise<void> {
    if (this.redis) {
      const keys = [
        this.metaKey(fileId),
        ...Array.from({ length: totalChunks }, (_, i) => this.chunkKey(fileId, i)),
      ];
      if (keys.length > 0) await this.redis.del(...keys);
    } else {
      for (let i = 0; i < totalChunks; i++) {
        this.memStore.delete(this.chunkKey(fileId, i));
      }
      this.memStore.delete(this.metaKey(fileId));
    }
  }

  /**
   * Cleanup stale uploads — hanya relevan untuk fallback in-memory.
   * Redis TTL menangani expiry secara otomatis.
   */
  /**
   * Parameter maxAgeMinutes dipertahankan untuk kompatibilitas signature
   * dengan test yang sudah ada, tapi tidak digunakan karena memStore
   * tidak menyimpan timestamp. Redis TTL menangani expiry otomatis.
   */
  cleanupStale(_maxAgeMinutes = 120): number {
    if (this.redis) return 0; // Redis TTL handles this

    const before = this.memStore.size;
    this.memStore.clear();
    return before;
  }
}
