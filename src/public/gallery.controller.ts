import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    const p = Math.max(1, Number(page || 1));
    const ps = Math.max(1, Math.min(50, Number(pageSize || 12)));
    
    const where: any = { isPublic: true };
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
        url: img.url,
        title: img.title,
        description: img.description,
        category: img.category,
        tags: img.tags,
        uploadedAt: img.uploadedAt.toISOString(),
      }))
    };
  }

  @Get('categories')
  async getCategories() {
    return {
      categories: [
        { value: 'journey', label: 'My Journey', count: 0 },
        { value: 'workshop', label: 'Workshops', count: 0 },
        { value: 'impact', label: 'Impact Stories', count: 0 }
      ]
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const img = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!img || !img.isPublic) return null;
    
    if (!img) return null;
    
    return {
      id: img.id,
      url: img.url,
  title: img.title || undefined,
  description: img.description || undefined,
      category: img.category,
      tags: img.tags,
      uploadedAt: img.uploadedAt.toISOString(),
    };
  }
}