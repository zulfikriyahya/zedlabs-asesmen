import { registerAs } from '@nestjs/config';

export const smtpConfig = registerAs('smtp', () => ({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT ?? '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER ?? '',
  pass: process.env.SMTP_PASS ?? '',
  from: process.env.SMTP_FROM ?? 'noreply@exam.app',
  enabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
}));
