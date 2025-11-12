import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GalleryImage } from '@prisma/client';

export interface CreateGalleryImageDto {
  filename: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateGalleryImageDto {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface GalleryImageFilters {
  category?: string;
  isPublic?: boolean;
  tags?: string[];
  page?: number;
  pageSize?: number;
}

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new gallery image entry after upload
   */
  async create(data: CreateGalleryImageDto): Promise<GalleryImage> {
    return this.prisma.galleryImage.create({
      data: {
        filename: data.filename,
        url: data.url,
        title: data.title,
        description: data.description,
        category: data.category || 'journey',
        tags: data.tags || [],
        isPublic: data.isPublic ?? true,
      },
    });
  }

  /**
   * Get all gallery images with optional filters
   */
  async findAll(filters: GalleryImageFilters = {}): Promise<{
    images: GalleryImage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const {
      category,
      isPublic,
      tags,
    } = filters;

    // Coerce pagination params to numbers (Query params arrive as strings)
    const pageNum = Math.max(1, Number((filters as any).page ?? 1) || 1);
    const pageSizeNum = Math.max(1, Number((filters as any).pageSize ?? 20) || 20);

    const where: any = {};
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };

    const total = await this.prisma.galleryImage.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSizeNum));
    const images = await this.prisma.galleryImage.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
    });

    return {
      images,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages
    };
  }

  /**
   * Get public gallery images (for frontend display)
   */
  async findPublic(category?: string): Promise<{ images: GalleryImage[] }> {
    const images = await this.prisma.galleryImage.findMany({
      where: { isPublic: true, ...(category ? { category } : {}) },
      orderBy: { uploadedAt: 'desc' },
    });
    return { images };
  }

  /**
   * Get gallery image by ID
   */
  async findOne(id: string): Promise<GalleryImage> {
    const image = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException(`Gallery image with ID ${id} not found`);
    return image;
  }

  /**
   * Update gallery image metadata
   */
  async update(id: string, data: UpdateGalleryImageDto): Promise<GalleryImage> {
    await this.findOne(id); // ensure exists
    return this.prisma.galleryImage.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        isPublic: data.isPublic,
      },
    });
  }

  /**
   * Delete gallery image
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.galleryImage.delete({ where: { id } });
  }

  /**
   * Get gallery statistics
   */
  async getStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    public: number;
    private: number;
  }> {
    const total = await this.prisma.galleryImage.count();
    const publicCount = await this.prisma.galleryImage.count({ where: { isPublic: true } });
    const categories = await this.prisma.galleryImage.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    const byCategory = categories.reduce((acc, c) => {
      acc[c.category] = c._count.category;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCategory,
      public: publicCount,
      private: total - publicCount
    };
  }
}