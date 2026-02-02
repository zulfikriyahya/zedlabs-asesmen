// src/lib/utils/validation.ts
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20;
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateRequired(value: any): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}