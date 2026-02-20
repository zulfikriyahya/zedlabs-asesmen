import { registerAs } from '@nestjs/config';
export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
  bucket: process.env.MINIO_BUCKET ?? 'exam-assets',
  presignedTtl: parseInt(process.env.MINIO_PRESIGNED_TTL ?? '3600', 10),
}));
