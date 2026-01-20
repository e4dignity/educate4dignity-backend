import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevSeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // In dev: if Prisma cannot reach the DB (for example Postgres not running),
    // skip automatic seeding so that the app can still start for frontend tests.
    try {
      const blogCount = await this.prisma.blogPost.count();
      if (blogCount === 0) {
        const now = new Date();
        await this.prisma.blogPost.createMany({ data: [
          {
            slug: 'menstrual-health-basics',
            title: 'Menstrual Health Basics',
            summary: 'Understanding cycles, hygiene, and how to support girls in school.',
            author: 'E4D Team',
            contentHtml: '<p>Menstrual health education helps girls stay in school with dignity.</p>',
            tags: ['education','health'],
            coverImageUrl: null,
            publishedAt: now,
            views: 0,
          },
          {
            slug: 'dignity-kits-explained',
            title: 'Dignity Kits Explained',
            summary: 'What goes inside a kit and why it matters.',
            author: 'E4D Team',
            contentHtml: '<p>A dignity kit provides reusable pads, soap and education materials.</p>',
            tags: ['kits','impact'],
            coverImageUrl: null,
            publishedAt: now,
            views: 0,
          }
        ]});
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[DevSeedService] Prisma not reachable, skipping dev seed.', err instanceof Error ? err.message : err);
    }
  }
}
