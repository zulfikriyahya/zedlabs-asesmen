type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: this.context,
      message,
      data
    };
  }

  info(message: string, data?: any) {
    if (import.meta.env.DEV) {
      console.log(`[INFO] [${this.context}] ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] [${this.context}] ${message}`, error || '');
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] [${this.context}] ${message}`, data || '');
  }
}

export const logger = new Logger();
export const createLogger = (context: string) => new Logger(context);