import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, ms, errors } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

const fileRotateTransport = (level: string) =>
  new winston.transports.DailyRotateFile({
    level,
    filename: `logs/${level}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: combine(timestamp(), errors({ stack: true }), winston.format.json()),
  });

export const AppLogger = WinstonModule.createLogger({
  transports: [
    // Console — pretty di dev, JSON di prod
    new winston.transports.Console({
      format: isProd
        ? combine(timestamp(), errors({ stack: true }), winston.format.json())
        : combine(
            timestamp(),
            ms(),
            errors({ stack: true }),
            nestWinstonModuleUtilities.format.nestLike('ExamAPI', {
              colors: true,
              prettyPrint: true,
            }),
          ),
    }),
    // File transports (hanya production)
    ...(isProd
      ? [fileRotateTransport('error'), fileRotateTransport('warn'), fileRotateTransport('info')]
      : []),
  ],
  exceptionHandlers: isProd ? [fileRotateTransport('exception')] : [],
  rejectionHandlers: isProd ? [fileRotateTransport('rejection')] : [],
});
