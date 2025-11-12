import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DevSeedService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Blog seed
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


  }
}
