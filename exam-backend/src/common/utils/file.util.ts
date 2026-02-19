// ── file.util.ts ─────────────────────────────────────────────────────────────
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export function generateObjectName(originalName: string, prefix = ''): string {
  const ext = path.extname(originalName);
  const name = uuidv4();
  return prefix ? `${prefix}/${name}${ext}` : `${name}${ext}`;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
