// src/lib/db/encryption.ts
import CryptoJS from 'crypto-js';

// Secret key - in production, this should be derived from user credentials
// For now, we use a fixed key (NOT SECURE FOR PRODUCTION)
const SECRET_KEY = 'exam-app-secret-key-2024';

/**
 * Encrypt data using AES
 */
export function encrypt(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES
 */
export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption resulted in empty string');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data using SHA256
 */
export function hash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate random IV for encryption
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString();
}