import CryptoJS from 'crypto-js';

const SALT = import.meta.env.PUBLIC_CRYPTO_SALT || 'default-salt';

export function hashString(str: string): string {
  return CryptoJS.SHA256(str + SALT).toString();
}

export function generateRandomString(length: number = 16): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

// Obfuscation sederhana untuk local storage (bukan enkripsi tingkat tinggi)
export function obfuscate(text: string): string {
  return btoa(text);
}

export function deobfuscate(text: string): string {
  try {
    return atob(text);
  } catch {
    return '';
  }
}