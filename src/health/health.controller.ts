import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async get() {
    try {
      // Simple lightweight prisma ping (raw select 1)
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return { ok: true, db: 'up', degraded: false, time: new Date().toISOString() };
    } catch (e) {
      return { ok: true, db: 'down', degraded: true, time: new Date().toISOString(), error: (e as any)?.message };
    }
  }
}
