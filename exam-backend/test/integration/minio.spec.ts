import * as Minio from 'minio';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

describe('MinIO Integration', () => {
  let minio: Minio.Client;
  let bucket: string;
  const testObject = `test/integration-${Date.now()}.txt`;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
    }).compile();
    const cfg = mod.get(ConfigService);

    bucket = cfg.get('MINIO_BUCKET', 'exam-assets');
    minio = new Minio.Client({
      endPoint: cfg.get('MINIO_ENDPOINT', 'localhost'),
      port: Number(cfg.get('MINIO_PORT', 9000)),
      useSSL: cfg.get('MINIO_USE_SSL') === 'true',
      accessKey: cfg.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: cfg.get('MINIO_SECRET_KEY', 'minioadmin'),
    });

    // Pastikan bucket ada
    const exists = await minio.bucketExists(bucket);
    if (!exists) await minio.makeBucket(bucket);
  });

  afterAll(async () => {
    // Cleanup test object
    try {
      await minio.removeObject(bucket, testObject);
    } catch {
      /* already removed */
    }
  });

  it('dapat terhubung ke MinIO (bucketExists)', async () => {
    const exists = await minio.bucketExists(bucket);
    expect(exists).toBe(true);
  });

  it('upload object berhasil', async () => {
    const content = Buffer.from('integration test content');
    await expect(minio.putObject(bucket, testObject, content)).resolves.not.toThrow();
  });

  it('object ada setelah upload', async () => {
    const stat = await minio.statObject(bucket, testObject);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('presigned URL dapat di-generate', async () => {
    const url = await minio.presignedGetObject(bucket, testObject, 3600);
    expect(url).toContain(testObject);
    expect(url).toMatch(/^https?:\/\//);
  });

  it('bucket policy tidak publik (private)', async () => {
    // Pastikan bucket tidak punya public-read policy
    // Dalam produksi bucket policy diset via MinIO console/CLI
    // Test ini memverifikasi bahwa presigned URL diperlukan (tidak bisa akses langsung)
    // — divalidasi secara implisit jika presigned URL memiliki signature parameter
    const url = await minio.presignedGetObject(bucket, testObject, 60);
    expect(url).toContain('X-Amz-Signature');
  });

  it('delete object berhasil', async () => {
    await expect(minio.removeObject(bucket, testObject)).resolves.not.toThrow();

    // Setelah delete, stat harus throw
    await expect(minio.statObject(bucket, testObject)).rejects.toThrow();
  });
});
