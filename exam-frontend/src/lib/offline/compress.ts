// src/lib/offline/compress.ts
import pako from 'pako';

export function compressData(data: string): Uint8Array {
  return pako.deflate(data);
}

export function decompressData(compressed: Uint8Array): string {
  return pako.inflate(compressed, { to: 'string' });
}

export function compressJSON(obj: any): Uint8Array {
  const jsonString = JSON.stringify(obj);
  return compressData(jsonString);
}

export function decompressJSON(compressed: Uint8Array): any {
  const jsonString = decompressData(compressed);
  return JSON.parse(jsonString);
}

export function base64Encode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data));
}

export function base64Decode(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}