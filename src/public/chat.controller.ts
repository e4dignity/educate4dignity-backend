import { Body, Controller, HttpException, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RateLimitInterceptor } from '../common/rate-limit.interceptor';
import { ChatService } from './chat.service';

class ChatHistoryItemDto {
  @IsString() role!: 'system'|'user'|'assistant';
  @IsString() @MinLength(1) content!: string;
}

class ChatRequestDto {
  @IsString() @MinLength(1)
  message!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];

  // Preferred response language (e.g., 'fr', 'en-US'); if omitted, service will detect from message
  @IsOptional()
  @IsString()
  lang?: string;
  
  // Optional current page path to bias answers (e.g., '/about' or '/projects')
  @IsOptional()
  @IsString()
  pagePath?: string;

  // Optional blog context to enrich responses with current blog content
  @IsOptional()
  @IsString()
  blogContext?: string;
}

@Controller('public')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('chat')
  @UseInterceptors(new RateLimitInterceptor({ windowMs: 60_000, limit: 10 }))
  async post(@Body() dto: ChatRequestDto) {
    if (!this.chat.isConfigured()) {
      throw new HttpException('Chat not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    const res = await this.chat.reply(dto.message, dto.history, dto.lang, dto.pagePath, dto.blogContext);
    if (!res.ok) {
      throw new HttpException('Chat upstream error', HttpStatus.BAD_GATEWAY);
    }
    return { reply: res.content } as const;
  }
}
