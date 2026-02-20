import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private initialized = false;

  constructor(private readonly cfg: ConfigService) {}

  onModuleInit() {
    const dsn = this.cfg.get<string>('SENTRY_DSN');
    const env = this.cfg.get<string>('NODE_ENV', 'development');

    if (!dsn) {
      this.logger.warn('SENTRY_DSN tidak dikonfigurasi — Sentry dinonaktifkan');
      return;
    }

    Sentry.init({
      dsn,
      environment: env,
      tracesSampleRate: this.cfg.get<number>('SENTRY_TRACES_SAMPLE_RATE', 0.1),
      integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
      beforeSend(event) {
        // Hapus data sensitif sebelum dikirim
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });

    this.initialized = true;
    this.logger.log(`Sentry diinisialisasi (env: ${env})`);
  }

  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) return;
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    if (!this.initialized) return;
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; tenantId: string; role: string }) {
    if (!this.initialized) return;
    Sentry.setUser({ id: user.id, tenantId: user.tenantId, role: user.role });
  }

  clearUser() {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }
}
