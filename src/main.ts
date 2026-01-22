import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { metricsRegistry as register, httpRequestDuration as httpHistogram } from './common/metrics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ==============================
  // Security middlewares
  // ==============================
  app.use(helmet());
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ==============================
  // CORS - fiable pour NestJS
  // ==============================
  const allowedOrigins = [
    'https://e4dignity.org',
    'https://www.e4dignity.org',
    'https://educate4dignity-frontend.onrender.com',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  });

  // ==============================
  // PRE-FLIGHT OPTIONS
  // Permet aux requêtes OPTIONS de passer avant les guards
  // ==============================
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      // Réponse rapide pour preflight, headers CORS déjà ajoutés par app.enableCors
      res.sendStatus(204);
    } else {
      next();
    }
  });

  // ==============================
  // Global API prefix
  // ==============================
  app.setGlobalPrefix('api');

  // ==============================
  // Validation pipe global
  // ==============================
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidUnknownValues: false,
  }));

  // ==============================
  // Metrics Prometheus
  // ==============================
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

  // ==============================
  // Port configuration
  // ==============================
  const config = app.get(ConfigService);
  const port = Number(process.env.PORT) || Number(config.get('PORT')) || 4000;

  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
