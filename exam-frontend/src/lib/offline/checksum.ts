// src/lib/offline/checksum.ts
import CryptoJS from 'crypto-js';

export function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}

export async function sha256ArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validateChecksum(data: any, expectedChecksum: string): boolean {
  const actualChecksum = generateChecksum(data);
  return actualChecksum === expectedChecksum;
}

export async function generateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}

export async function generateBlobChecksum(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return await sha256ArrayBuffer(buffer);
}