import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors, InternalServerErrorException, Get, Param, Put, Delete, Body, Query } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { GalleryService, CreateGalleryImageDto, UpdateGalleryImageDto, GalleryImageFilters } from './gallery.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

@Controller('uploads')
export class UploadsController {
  constructor(
    private cloud: CloudinaryService,
    private galleryService: GalleryService,
    private prisma: PrismaService
  ) {}

  @Post('report')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN', 'TEAM')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadReport(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    try {
      const res = await this.cloud.client.uploader.upload(dataUri, { folder: 'reports' });
      return { url: res.secure_url };
    } catch (err) {
      const e = err as any;
      // log full error server-side for debugging
      // eslint-disable-next-line no-console
      console.error('[UploadsController] uploadReport error:', e && e.stack ? e.stack : e);
      throw new InternalServerErrorException('failed to upload file: ' + (e?.message || 'unknown'));
    }
  }

  // === GALLERY ENDPOINTS ===

  /**
   * Upload image to gallery (Admin only)
   */
  @Post('gallery')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', { 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    }
  }))
  async uploadGalleryImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() metadata: { title?: string; description?: string; category?: string; tags?: string }
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    
    try {
      // Upload to Cloudinary
      const uploadResult = await this.cloud.client.uploader.upload(dataUri, { 
        folder: 'gallery',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
          { format: 'auto' }
        ]
      });

      // Parse tags
      const tags = metadata.tags ? metadata.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      // Save to database
      const galleryImage = await this.galleryService.create({
        filename: file.originalname,
        url: uploadResult.secure_url,
        title: metadata.title,
        description: metadata.description,
        category: metadata.category || 'education',
        tags,
        isPublic: true
      });

      return galleryImage;
    } catch (err) {
      const e = err as any;
      console.error('[UploadsController] uploadGalleryImage error:', e?.stack || e);
      throw new InternalServerErrorException('Failed to upload image: ' + (e?.message || 'unknown'));
    }
  }

  /**
   * Get all gallery images (Admin)
   */
  @Get('gallery')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async getGalleryImages(@Query() filters: GalleryImageFilters) {
    return this.galleryService.findAll(filters);
  }

  /**
   * Get public gallery images (No auth required)
   */
  @Get('gallery/public')
  async getPublicGalleryImages(@Query('category') category?: string) {
    return this.galleryService.findPublic(category);
  }

  /**
   * Get gallery image by ID
   */
  @Get('gallery/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async getGalleryImage(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  /**
   * Update gallery image metadata
   */
  @Put('gallery/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async updateGalleryImage(
    @Param('id') id: string,
    @Body() updateData: UpdateGalleryImageDto
  ) {
    return this.galleryService.update(id, updateData);
  }

  /**
   * Delete gallery image
   */
  @Delete('gallery/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async deleteGalleryImage(@Param('id') id: string) {
    await this.galleryService.remove(id);
    return { message: 'Image deleted successfully' };
  }

  /**
   * Get gallery statistics
   */
  @Get('gallery-stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async getGalleryStats() {
    return this.galleryService.getStats();
  }

  // === BLOG IMAGE UPLOAD ===

  /**
   * Upload an image for blog content (cover or inline) and persist a DB record
   * Body params:
   * - slug?: string (blog post slug to link the image)
   * - role?: 'cover' | 'inline' (default: 'inline')
   * - alt?: string
   */
  @Post('blog-image')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('image', {
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    }
  }))
  async uploadBlogImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { slug?: string; role?: string; alt?: string }
  ) {
    if (!file) throw new BadRequestException('Image file is required');

    // Prepare upload
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const role = (body.role === 'cover' || body.role === 'inline') ? body.role : 'inline';

    try {
      // Upload to Cloudinary under 'blog'
      const uploadResult = await this.cloud.client.uploader.upload(dataUri, {
        folder: 'blog',
        transformation: [
          { width: 1600, crop: 'limit', quality: 'auto:good' },
          { format: 'auto' }
        ]
      });

      // Attempt to link to post by slug if provided
      let postId: string | undefined;
      if (body.slug) {
        const post = await this.prisma.blogPost.findUnique({ where: { slug: body.slug } });
        postId = post?.id;
        // Optional: if role is cover and post exists, update coverImageUrl
        if (post && role === 'cover') {
          await this.prisma.blogPost.update({ where: { id: post.id }, data: { coverImageUrl: uploadResult.secure_url } });
        }
      }

      // Ensure BlogImage table exists (non-destructive, dev-friendly).
      // Postgres drivers may reject multiple statements in a single prepared statement,
      // so execute the DDL statements separately.
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
        )
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "_idx_blogimage_postid" ON "BlogImage" ("postId")
      `);

      // Persist BlogImage record via raw SQL (works even if Prisma client types aren't regenerated)
      const width = (uploadResult as any)?.width || null;
      const height = (uploadResult as any)?.height || null;
      const id = randomUUID();
      const rows = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "BlogImage" ("id", "postId", "role", "url", "filename", "alt", "width", "height")
        VALUES (${id}, ${postId || null}, ${role}, ${uploadResult.secure_url}, ${file.originalname}, ${body.alt || null}, ${width}, ${height})
        RETURNING "id", "url", "role", "alt", "width", "height", "postId", "uploadedAt";
      `;
      const rec = rows && rows[0] ? rows[0] : null;
      return rec || { url: uploadResult.secure_url, role, alt: body.alt || null, width, height, postId: postId || null };
    } catch (err) {
      const e = err as any;
      console.error('[UploadsController] uploadBlogImage error:', e?.stack || e);
      throw new InternalServerErrorException('Failed to upload blog image: ' + (e?.message || 'unknown'));
    }
  }
}
