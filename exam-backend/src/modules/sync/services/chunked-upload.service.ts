// ── services/chunked-upload.service.ts ───────────────────
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChunkedUploadService {
  private readonly tmpDir = path.join(process.cwd(), 'uploads', 'temp');

  async saveChunk(fileId: string, chunkIndex: number, data: Buffer) {
    const dir = path.join(this.tmpDir, fileId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `chunk_${chunkIndex}`), data);
  }

  async assemble(fileId: string, totalChunks: number): Promise<Buffer> {
    const dir = path.join(this.tmpDir, fileId);
    const chunks = Array.from({ length: totalChunks }, (_, i) =>
      fs.readFileSync(path.join(dir, `chunk_${i}`)),
    );
    const assembled = Buffer.concat(chunks);
    fs.rmSync(dir, { recursive: true, force: true });
    return assembled;
  }
}
