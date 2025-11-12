import { Injectable, NotFoundException } from '@nestjs/common';
import { blogViewsTotal } from '../common/metrics';
import { PrismaService } from '../prisma/prisma.service';
// We do not use the generated BlogPost type's select narrow default; we rely on full model fields.
import { BlogPost } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async list(params: { tag?: string; q?: string; page: number; pageSize: number }) {
    const { tag, q, page, pageSize } = params;
    const where: any = { status: 'published', publishedAt: { not: null } };
    if (tag) where.tags = { has: tag };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
    ];
    // Select only the fields we actually map to avoid TS complaining about missing optional fields
    const rows = await this.prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        coverImageUrl: true,
        summary: true,
        author: true,
        publishedAt: true,
        tags: true,
        readMinutes: true,
      }
    });
    return rows.map(r => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      coverImageUrl: r.coverImageUrl || undefined,
      summary: r.summary,
      author: r.author,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : undefined,
      tags: r.tags || [],
      readMinutes: r.readMinutes,
    }));
  }

  async getBySlug(slug: string) {
    const r = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        contentHtml: true,
        category: true,
        coverImageUrl: true,
        author: true,
        publishedAt: true,
        tags: true,
        readMinutes: true,
        views: true,
      }
    });
    if (!r) throw new NotFoundException('Blog post not found');
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      contentHtml: r.contentHtml,
      category: r.category,
      coverImageUrl: r.coverImageUrl || undefined,
      author: r.author,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : undefined,
      tags: r.tags || [],
      readMinutes: r.readMinutes,
      views: r.views,
    };
  }

  async trackView(id: string) {
    await this.prisma.blogPost.update({ where: { id }, data: { views: { increment: 1 } } });
    try { blogViewsTotal.inc(); } catch {}
  }
}
