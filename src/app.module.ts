import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PaymentsModule } from './payments/payments.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { UploadsController } from './uploads/uploads.controller';
import { CloudinaryService } from './uploads/cloudinary.service';
import { GalleryService } from './uploads/gallery.service';
import { NotificationService } from './common/notification.service';
import { DevController } from './dev/dev.controller';
import { BlogModule } from './blog/blog.module';
import { AdminBlogController } from './admin/admin-blog.controller';
import { AdminGalleryController } from './admin/admin-gallery.controller';
import { AdminDashboardController } from './admin/admin-dashboard.controller';
import { AdminDonorsController } from './admin/admin-donors.controller';
import { PublicModule } from './public/public.module';
import { DevSeedService } from './dev/dev-seed.service';
// Removed TypeORM entities & feature module – Prisma-only stack

@Module({
  imports: [
    // Load environment from .env.local (highest), then .env, then .env.example (dev fallback only)
  // Load .env (base), then .env.example as fallback defaults, then .env.local as highest priority overrides
  // Load only real env files, not .env.example (documentation only)
  // Order matters: later entries override earlier ones
  ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '.env.local'] }),
  ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 100 }] }),
  // TypeORM configuration removed – relying exclusively on Prisma (see prisma/schema.prisma)
  PrismaModule,
  PaymentsModule,
  AuthModule,
  BlogModule,
  PublicModule,
  ],
  controllers: [HealthController, UploadsController, DevController, AdminBlogController, AdminGalleryController, AdminDashboardController, AdminDonorsController],
  providers: [
    PrismaService,
    CloudinaryService,
    GalleryService,
    NotificationService,
    DevSeedService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
