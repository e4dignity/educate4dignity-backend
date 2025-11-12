import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Options = { windowMs: number; limit: number; key?: (ctx: ExecutionContext) => string };

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private hits = new Map<string, number[]>();
  private windowMs: number;
  private limit: number;
  private keyFn: (ctx: ExecutionContext) => string;

  constructor(opts?: Partial<Options>){
    this.windowMs = opts?.windowMs ?? 60_000; // default 1 minute
    this.limit = opts?.limit ?? 10;
    this.keyFn = opts?.key ?? ((ctx) => {
      const req: any = ctx.switchToHttp().getRequest();
      // X-Forwarded-For first if behind proxy; fallback to req.ip
      return (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip || 'global';
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.keyFn(context);
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const arr = (this.hits.get(key) || []).filter((t) => t > windowStart);
    if (arr.length >= this.limit) {
      // Too many requests; emulate 429
      const err: any = new Error('Too many requests');
      err.status = 429;
      return throwError(() => err);
    }
    arr.push(now);
    this.hits.set(key, arr);
    return next.handle().pipe(
      catchError((e) => {
        // Optional: on error, still keep the hit record
        return throwError(() => e);
      })
    );
  }
}
