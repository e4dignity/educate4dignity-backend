import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { NotificationService } from '../common/notification.service';
import { RateLimitInterceptor } from '../common/rate-limit.interceptor';

class ContactDto {
  @IsString() @MinLength(2)
  name!: string;
  @IsEmail()
  email!: string;
  @IsString() @MinLength(3)
  subject!: string;
  @IsString() @MinLength(10)
  message!: string;
}

@Controller('public')
export class ContactController {
  constructor(private notifier: NotificationService) {}

  @Post('contact')
  @UseInterceptors(new RateLimitInterceptor({ windowMs: 60_000, limit: 5 }))
  async submit(@Body() dto: ContactDto){
    // Enqueue a notification to admins (placeholder logs for now)
    await this.notifier.send({ type: 'system', to: 'admins' }, `Contact: ${dto.subject}`, `${dto.name} <${dto.email}>: ${dto.message}`);
    return { ok: true };
  }
}
