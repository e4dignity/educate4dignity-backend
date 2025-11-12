import { Controller, Get, Param, Query, Post, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { RateLimitInterceptor } from '../common/rate-limit.interceptor';

@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  async list(
    @Query('tag') tag?: string,
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(50, Math.max(1, Number(pageSize) || 10));
    return this.blog.list({ tag, q, page: p, pageSize: ps });
  }

  @Get(':slug')
  async one(@Param('slug') slug: string) {
    return this.blog.getBySlug(slug);
  }

  @Post(':id/track-view')
  @UseInterceptors(new RateLimitInterceptor({ windowMs: 60_000, limit: 20 }))
  async track(@Param('id') id: string) {
    await this.blog.trackView(id);
    return { ok: true };
  }
}
