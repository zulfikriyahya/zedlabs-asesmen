import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly enabled: boolean;
  private readonly from: string;

  constructor(private readonly cfg: ConfigService) {
    const user = cfg.get<string>('SMTP_USER');
    const pass = cfg.get<string>('SMTP_PASS');
    this.enabled = !!(user && pass);
    this.from = cfg.get<string>('SMTP_FROM', 'noreply@exam.app');

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: cfg.get<string>('SMTP_HOST', 'smtp.gmail.com'),
        port: cfg.get<number>('SMTP_PORT', 587),
        secure: cfg.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('Email service diinisialisasi');
    } else {
      this.logger.warn('SMTP tidak dikonfigurasi — email dinonaktifkan');
    }
  }

  async send(opts: SendMailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      this.logger.debug(`[EMAIL SKIP] To: ${opts.to} | Subject: ${opts.subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      this.logger.log(`Email terkirim ke ${opts.to}: ${opts.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Gagal kirim email ke ${opts.to}: ${(err as Error).message}`);
      return false;
    }
  }

  async sendSessionActivated(opts: {
    to: string;
    name: string;
    sessionTitle: string;
    tokenCode: string;
    startTime: Date;
    endTime: Date;
  }): Promise<boolean> {
    return this.send({
      to: opts.to,
      subject: `[Ujian] Sesi "${opts.sessionTitle}" telah dimulai`,
      html: `
        <h2>Sesi Ujian Dimulai</h2>
        <p>Halo <strong>${opts.name}</strong>,</p>
        <p>Sesi ujian <strong>${opts.sessionTitle}</strong> telah diaktifkan.</p>
        <p><strong>Token Anda:</strong> <code style="font-size:1.5em;letter-spacing:4px">${opts.tokenCode}</code></p>
        <p>Waktu: ${opts.startTime.toLocaleString('id-ID')} — ${opts.endTime.toLocaleString('id-ID')}</p>
        <p>Segera login dan masukkan token untuk memulai ujian.</p>
      `,
      text: `Sesi ${opts.sessionTitle} dimulai. Token: ${opts.tokenCode}`,
    });
  }

  async sendResultPublished(opts: {
    to: string;
    name: string;
    sessionTitle: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
  }): Promise<boolean> {
    const passed = opts.percentage >= 70;
    return this.send({
      to: opts.to,
      subject: `[Ujian] Nilai "${opts.sessionTitle}" telah dipublikasi`,
      html: `
        <h2>Hasil Ujian Tersedia</h2>
        <p>Halo <strong>${opts.name}</strong>,</p>
        <p>Nilai Anda untuk sesi <strong>${opts.sessionTitle}</strong>:</p>
        <table>
          <tr><td>Skor</td><td>${opts.totalScore} / ${opts.maxScore}</td></tr>
          <tr><td>Persentase</td><td>${opts.percentage}%</td></tr>
          <tr><td>Status</td><td style="color:${passed ? 'green' : 'red'}">${passed ? 'LULUS' : 'TIDAK LULUS'}</td></tr>
        </table>
        <p>Login untuk melihat detail jawaban.</p>
      `,
      text: `Nilai ${opts.sessionTitle}: ${opts.totalScore}/${opts.maxScore} (${opts.percentage}%)`,
    });
  }
}
