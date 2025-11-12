import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin/gallery')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminGalleryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    const p = Math.max(1, Number(page || 1));
    const ps = Math.max(1, Math.min(100, Number(pageSize || 20)));
    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (tag) where.tags = { has: tag };
    const [rows, total] = await Promise.all([
      this.prisma.galleryImage.findMany({ where, orderBy: { uploadedAt: 'desc' }, skip: (p-1)*ps, take: ps }),
      this.prisma.galleryImage.count({ where })
    ]);
    return {
      total,
      items: rows.map(img => ({
        id: img.id,
        filename: img.filename,
        url: img.url,
        title: img.title || undefined,
        description: img.description || undefined,
        category: img.category,
        tags: img.tags,
        uploadedAt: img.uploadedAt.toISOString(),
        isPublic: img.isPublic,
      }))
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const img = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!img) return null;
    return {
      id: img.id,
      filename: img.filename,
      url: img.url,
      title: img.title || undefined,
      description: img.description || undefined,
      category: img.category,
      tags: img.tags,
      uploadedAt: img.uploadedAt.toISOString(),
      isPublic: img.isPublic,
    };
  }

  @Post()
  async create(@Body() body: {
    filename: string;
    url: string;
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const saved = await this.prisma.galleryImage.create({
      data: {
        filename: body.filename,
        url: body.url,
        title: body.title,
        description: body.description,
        category: body.category || 'journey',
        tags: Array.isArray(body.tags) ? body.tags : [],
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
      }
    });
    return { id: saved.id };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) return null;
    const saved = await this.prisma.galleryImage.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        category: body.category ?? existing.category,
        tags: Array.isArray(body.tags) ? body.tags : existing.tags,
        isPublic: typeof body.isPublic === 'boolean' ? body.isPublic : existing.isPublic,
      }
    });
    return { id: saved.id };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.galleryImage.delete({ where: { id } });
    return { ok: true };
  }

  @Post(':id/toggle-public')
  async togglePublic(@Param('id') id: string) {
    const existing = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) return null;
    const saved = await this.prisma.galleryImage.update({ where: { id }, data: { isPublic: !existing.isPublic } });
    return { id: saved.id, isPublic: saved.isPublic };
  }
}