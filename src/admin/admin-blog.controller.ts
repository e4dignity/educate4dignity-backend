import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CloudinaryService } from '../uploads/cloudinary.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

function mdToHtml(md: string): string {
  if (!md) return '';
  let html = md;
  // Basic markdown: bold, italic, links, line breaks/paragraphs
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1<\/a>');
  html = html.split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,'<br/>')}</p>`).join('');
  return html;
}

@Controller('admin/blog')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminBlogController {
  constructor(private readonly prisma: PrismaService, private readonly cloud: CloudinaryService) {}

  private async uploadDataUrisToCloudinary(html: string): Promise<{ html: string; uploaded: Array<{ url: string; width?: number|null; height?: number|null; alt?: string|null }> }> {
    if (!html || !/data:image\//i.test(html)) return { html, uploaded: [] };
    const uploads: Array<{ placeholder: string; url: string; width?: number|null; height?: number|null; alt?: string|null }> = [];
    // Find all <img ... src="data:..." ...>
    const re = /<img[^>]*src=["'](data:[^"']+)["'][^>]*>/gi;
    const tasks: Array<Promise<void>> = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const dataUri = m[1];
      // Extract alt if present within this tag (naive)
      const tag = m[0];
      const altMatch = tag.match(/alt=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : null;
      tasks.push((async () => {
        const res = await this.cloud.client.uploader.upload(dataUri, {
          folder: 'blog',
          transformation: [
            { width: 1600, crop: 'limit', quality: 'auto:good' },
            { format: 'auto' }
          ]
        });
        uploads.push({ placeholder: dataUri, url: res.secure_url, width: (res as any)?.width || null, height: (res as any)?.height || null, alt });
      })());
    }
    if (tasks.length) await Promise.all(tasks);
    let newHtml = html;
    for (const u of uploads) {
      // Replace only the src attribute value; careful to escape special chars
      const escaped = u.placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const srcRe = new RegExp(`src=["']${escaped}["']`, 'g');
      newHtml = newHtml.replace(srcRe, `src="${u.url}"`);
    }
    return { html: newHtml, uploaded: uploads.map(u => ({ url: u.url, width: u.width, height: u.height, alt: u.alt })) };
  }

  @Get()
  async list(@Query('q') q?: string, @Query('tag') tag?: string, @Query('status') status?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = Math.max(1, Number(page||1));
    const ps = Math.max(1, Math.min(100, Number(pageSize||50)));
    const where: any = {};
    if (status && status !== 'all') {
      if (status === 'published') where.publishedAt = { not: null };
      else if (status === 'draft') where.publishedAt = null;
    }
    if (tag) where.tags = { has: tag };
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } }
    ];
    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (p-1)*ps, take: ps }),
      this.prisma.blogPost.count({ where })
    ]);
    return {
      total,
      items: rows.map(r=> ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        category: r.category,
        tags: r.tags || [],
        author: r.author,
        status: r.publishedAt ? 'published' : 'draft',
        summary: r.summary || '',
        publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
        updatedAt: r.updatedAt?.toISOString?.() || null,
        coverImageUrl: r.coverImageUrl || undefined,
      }))
    };
  }

  @Get(':slug')
  async get(@Param('slug') slug: string) {
    const r = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!r) return null;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      tags: r.tags || [],
      author: r.author,
      status: r.publishedAt ? 'published' : 'draft',
      summary: r.summary || '',
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      updatedAt: r.updatedAt?.toISOString?.() || null,
      coverImageUrl: r.coverImageUrl || undefined,
      contentHtml: r.contentHtml,
    };
  }

  @Post()
  async create(@Body() body: any) {
    const now = new Date();
  const htmlRaw = body.contentHtml || mdToHtml(body.contentMd || body.body_md || '');
  // Ensure any data URI images are uploaded to Cloudinary and replaced in HTML
  const processed = await this.uploadDataUrisToCloudinary(htmlRaw);
  const html = processed.html;
    const slug = (body.slug || body.title || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const publishedAtValue = body.publishedAt ? new Date(body.publishedAt) : (body.status === 'published' ? now : undefined);
    const saved = await this.prisma.blogPost.create({
      data: {
        slug,
        title: body.title,
        summary: body.summary || body.excerpt || '',
  contentHtml: html,
        author: body.author || body.author_name || 'E4D Ops',
        coverImageUrl: body.coverImageUrl || body.cover_image_url || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        publishedAt: publishedAtValue,
      }
    });

  // Persist cover image as BlogImage (role 'cover') if provided
    const coverUrl = body.coverImageUrl || body.cover_image_url;
    if (coverUrl) {
      try {
        // Ensure BlogImage table exists (non-destructive) & add FK if missing
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "BlogImage" (
            "id" TEXT PRIMARY KEY,
            "postId" TEXT NULL,
            "role" TEXT NOT NULL DEFAULT 'inline',
            "url" TEXT NOT NULL,
            "filename" TEXT NOT NULL,
            "alt" TEXT NULL,
            "width" INTEGER NULL,
            "height" INTEGER NULL,
            "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `);
        // Insert only if no existing cover image with same URL for this post
        const existing = await this.prisma.$queryRaw<any[]>`SELECT "id" FROM "BlogImage" WHERE "postId" = ${saved.id} AND "role" = 'cover' AND "url" = ${coverUrl} LIMIT 1;`;
        if (!existing || existing.length === 0) {
          const id = randomUUID();
          await this.prisma.$executeRawUnsafe(`INSERT INTO "BlogImage" ("id","postId","role","url","filename") VALUES ('${id}','${saved.id}','cover','${coverUrl.replace(/'/g,"''")}','cover');`);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn('[AdminBlogController] Failed to persist cover BlogImage:', err?.message || err);
      }
    }
    // Persist newly uploaded inline images as BlogImage
    if (processed.uploaded?.length) {
      for (const img of processed.uploaded) {
        try {
          const id = randomUUID();
          const alt = img.alt ? img.alt.replace(/'/g, "''") : null;
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO "BlogImage" ("id","postId","role","url","filename","alt","width","height") VALUES ('${id}','${saved.id}','inline','${img.url.replace(/'/g, "''")}','inline',${alt?`'${alt}'`:'NULL'},${img.width??'NULL'},${img.height??'NULL'})`
          );
        } catch {}
      }
    }
    return { id: saved.id, slug: saved.slug };
  }

  @Put(':slug')
  async update(@Param('slug') slug: string, @Body() body: any) {
  const htmlRaw = body.contentHtml || mdToHtml(body.contentMd || body.body_md || '');
  const processed = await this.uploadDataUrisToCloudinary(htmlRaw);
  const html = processed.html;
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) return null;
    const publishedAtUpdate = typeof body.status === 'string'
      ? (body.status === 'published' ? (existing.publishedAt || new Date()) : undefined)
      : (body.publishedAt ? new Date(body.publishedAt) : undefined);
    const saved = await this.prisma.blogPost.update({
      where: { slug },
      data: {
        title: body.title ?? existing.title,
        summary: (body.summary ?? body.excerpt) ?? existing.summary,
  contentHtml: html || existing.contentHtml,
        author: (body.author ?? body.author_name) ?? existing.author,
        coverImageUrl: (body.coverImageUrl ?? body.cover_image_url) ?? existing.coverImageUrl,
        tags: Array.isArray(body.tags) ? body.tags : existing.tags,
        publishedAt: publishedAtUpdate,
      }
    });

  // If cover image changed, persist new BlogImage record
    const newCover = (body.coverImageUrl ?? body.cover_image_url) || null;
    if (newCover && newCover !== existing.coverImageUrl) {
      try {
        const id = randomUUID();
        await this.prisma.$executeRawUnsafe(`INSERT INTO "BlogImage" ("id","postId","role","url","filename") VALUES ('${id}','${saved.id}','cover','${newCover.replace(/'/g,"''")}','cover');`);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn('[AdminBlogController] Failed to persist updated cover BlogImage:', err?.message || err);
      }
    }
    // Persist any newly uploaded inline images
    if (processed.uploaded?.length) {
      for (const img of processed.uploaded) {
        try {
          const id = randomUUID();
          const alt = img.alt ? img.alt.replace(/'/g, "''") : null;
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO "BlogImage" ("id","postId","role","url","filename","alt","width","height") VALUES ('${id}','${saved.id}','inline','${img.url.replace(/'/g, "''")}','inline',${alt?`'${alt}'`:'NULL'},${img.width??'NULL'},${img.height??'NULL'})`
          );
        } catch {}
      }
    }
    return { id: saved.id, slug: saved.slug };
  }

  @Post(':slug/publish')
  async publish(@Param('slug') slug: string) {
    await this.prisma.blogPost.update({ where: { slug }, data: { publishedAt: new Date() } });
    return { ok: true };
  }

  @Post(':slug/unpublish')
  async unpublish(@Param('slug') slug: string) {
    await this.prisma.blogPost.update({ where: { slug }, data: { publishedAt: undefined } });
    return { ok: true };
  }

  @Delete(':slug')
  async remove(@Param('slug') slug: string) {
    await this.prisma.blogPost.delete({ where: { slug } });
    return { ok: true };
  }

  // List images linked to a blog post
  @Get(':slug/images')
  async listImages(@Param('slug') slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return { items: [] };
    // Raw query to be resilient even if migration drift exists
    try {
      const rows = await this.prisma.$queryRaw<any[]>`SELECT "id","role","url","filename","alt","width","height","uploadedAt" FROM "BlogImage" WHERE "postId" = ${post.id} ORDER BY "uploadedAt" DESC;`;
      return { items: rows.map(r => ({
        id: r.id,
        role: r.role,
        url: r.url,
        filename: r.filename,
        alt: r.alt,
        width: r.width,
        height: r.height,
        uploadedAt: r.uploadedAt,
      })) };
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminBlogController] listImages error:', err?.message || err);
      return { items: [] };
    }
  }

  // Delete a specific blog image (cover deletion does not unset coverImageUrl automatically)
  @Delete(':slug/images/:id')
  async deleteImage(@Param('slug') slug: string, @Param('id') id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return { ok: false, reason: 'not_found' };
    try {
      await this.prisma.$executeRawUnsafe(`DELETE FROM "BlogImage" WHERE "id"='${id.replace(/'/g,"''")}' AND "postId"='${post.id.replace(/'/g,"''")}'`);
      return { ok: true };
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn('[AdminBlogController] deleteImage error:', err?.message || err);
      return { ok: false };
    }
  }
}
