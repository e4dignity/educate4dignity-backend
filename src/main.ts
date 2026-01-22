import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { metricsRegistry as register, httpRequestDuration as httpHistogram } from './common/metrics';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middlewares
  app.use(helmet());
  // Increase body size limits to allow project creation payloads with attachments/large descriptions
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  // Configure CORS: allow cPanel site(s) and optionally additional origins via env (CORS_ORIGINS)
  const defaultAllowed = [
    'https://e4dignity.org',
    'https://www.e4dignity.org',
    'https://educate4dignity-frontend.onrender.com',
  ];
  const extra = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const allowedOrigins = [...defaultAllowed, ...extra];
  app.enableCors({
    origin: [
      'https://e4dignity.org',
      'https://www.e4dignity.org',
      'https://educate4dignity-frontend.onrender.com',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  });


  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidUnknownValues: false,
  }));
  // Throttling is applied globally via APP_GUARD in AppModule.

  const config = app.get(ConfigService);
  const port = Number(process.env.PORT) || Number(config.get('PORT')) || 4000;

  // Prometheus is configured in common/metrics
  app.use((req: Request, res: Response, next: NextFunction) => {
    const end = httpHistogram.startTimer({ method: req.method });
    res.on('finish', () => {
      end({ route: req.route?.path || req.path || 'unknown', status_code: String(res.statusCode) });
    });
    next();
  });
  app.getHttpAdapter().get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
