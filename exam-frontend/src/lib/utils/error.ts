export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui';
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('Network Error') || 
    error.message.includes('Failed to fetch') ||
    error.name === 'NetworkError'
  );
}