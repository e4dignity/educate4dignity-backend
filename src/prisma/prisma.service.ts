import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Allow disabling Prisma entirely when migrating to TypeORM
    const truthy = (v?: string | null) => {
      if (!v) return false;
      return ['1', 'true', 'yes', 'y', 'on'].includes(String(v).trim().toLowerCase());
    };
    const disabled = truthy(process.env.USE_TYPEORM_ONLY) || truthy(process.env.PRISMA_DISABLED);
    if (disabled) {
      // eslint-disable-next-line no-console
      console.log('[Prisma] Disabled by env (USE_TYPEORM_ONLY/PRISMA_DISABLED). Skipping connection.');
      (this as any).__degraded = true;
      return;
    }
    try {
      await this.$connect();
      // eslint-disable-next-line no-console
      console.log('[Prisma] Connected to database');
    } catch (err: any) {
      // Allow the app to boot in degraded mode when DB is not reachable
      // This lets purely-static endpoints run and helps local dev without Postgres
      // Controllers should guard prisma calls accordingly.
      // eslint-disable-next-line no-console
      console.warn('[Prisma] Failed to connect. Running in degraded (no-DB) mode.');
      // Optional: expose a flag for controllers to check
      (this as any).__degraded = true;
    }
  }
  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
