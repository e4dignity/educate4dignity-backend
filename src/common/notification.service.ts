import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export type NotificationTarget = { type: 'email' | 'system'; to: string };

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter?: Transporter;
  private readonly fromAddress: string;
  private readonly adminRecipients: string[];

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT') || 0);
    const user = config.get<string>('SMTP_USER');
    // Gmail app passwords are often copied with spaces for readability; strip all whitespace.
    const passRaw = config.get<string>('SMTP_PASS');
    const pass = passRaw ? passRaw.replace(/\s+/g, '') : undefined;
    const secure = String(config.get<string>('SMTP_SECURE') || '').toLowerCase() === 'true' || port === 465;
    this.fromAddress = config.get<string>('SENDER_EMAIL') || user || 'no-reply@example.org';
    this.adminRecipients = (config.get<string>('NOTIFY_ADMIN_TO') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transporter initialised for ${user} @ ${host}:${port} (secure=${secure})`);
    } else {
      this.logger.warn('SMTP not fully configured. Emails will be logged only. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
    }
  }

  async send(target: NotificationTarget, subject: string, message: string, meta?: Record<string, any>) {
    const metaText = meta ? `\n\n${JSON.stringify(meta, null, 2)}` : '';
    const toList = this.resolveRecipients(target);

    if (!toList.length) {
      this.logger.warn(`No recipients resolved for target ${target.type}:${target.to}.`);
      return { ok: false as const, reason: 'no-recipients' };
    }

    const text = `${message}${metaText}`;

    if (!this.transporter) {
      // Log-only fallback
      this.logger.log(`(LOG-ONLY) Email -> [${toList.join(', ')}]: ${subject} :: ${text}`);
      return { ok: true as const, logged: true };
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: toList.join(', '),
        subject,
        text,
      });
      return { ok: true as const };
    } catch (err: any) {
      this.logger.error(`Failed to send email: ${err?.message || err}`);
      return { ok: false as const, reason: 'smtp-error', error: String(err?.message || err) };
    }
  }

  private resolveRecipients(target: NotificationTarget): string[] {
    if (target.type === 'email') return [target.to];
    // system targets
    if (target.to === 'admins') return this.adminRecipients;
    // unknown system target -> log only
    return [];
  }
}
