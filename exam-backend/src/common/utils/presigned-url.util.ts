// ── presigned-url.util.ts ────────────────────────────────────────────────────
// Wrapper tipis — implementasi nyata ada di media.service menggunakan MinIO client
export function buildPresignedPath(bucket: string, objectName: string): string {
  return `${bucket}/${objectName}`;
}
