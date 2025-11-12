import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { NotificationService } from '../common/notification.service';
import { RateLimitInterceptor } from '../common/rate-limit.interceptor';

class SubscribeDto {
  @IsEmail()
  email!: string;
}

@Controller('public/newsletter')
export class NewsletterController {
  constructor(private notifier: NotificationService) {}

  @Post('subscribe')
  @UseInterceptors(new RateLimitInterceptor({ windowMs: 60_000, limit: 8 }))
  async subscribe(@Body() dto: SubscribeDto) {
    // Send a simple confirmation to the subscriber (if SMTP configured)
    await this.notifier.send({ type: 'email', to: dto.email }, 'Thanks for subscribing', 'You are subscribed to Educate4Dignity updates. You can unsubscribe anytime.');
    // Notify admins
    await this.notifier.send({ type: 'system', to: 'admins' }, 'New newsletter subscriber', `Email: ${dto.email}`);
    return { ok: true } as const;
  }
}
