import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { metricsRegistry as register, httpRequestDuration as httpHistogram } from './common/metrics';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ======================================================
  // 1. CORS - MUST BE INITIALIZED FIRST
  // ======================================================
  const allowedOrigins = [
    'https://e4dignity.org',
    'https://www.e4dignity.org',
    'https://educate4dignity-frontend.onrender.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) 
      // or check if the origin is in the allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // ======================================================
  // 2. SECURITY MIDDLEWARES
  // ======================================================
  app.use(helmet({
    // Important: Disable standard resource policy which can block cross-origin loads
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ======================================================
  // 3. GLOBAL CONFIGURATION
  // ======================================================
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidUnknownValues: false,
  }));

  // ======================================================
  // 4. METRICS & PROMETHEUS
  // ======================================================
  app.use((req: Request, res: Response, next: NextFunction) => {
    const end = httpHistogram.startTimer({ method: req.method });
    res.on('finish', () => {
      const route = req.route?.path || req.path || 'unknown';
      end({ route, status_code: String(res.statusCode) });
    });
    next();
  });

  app.getHttpAdapter().get('/metrics', async (_req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  });

  // ======================================================
  // 5. SERVER STARTUP
  // ======================================================
  const config = app.get(ConfigService);
  // Using 0.0.0.0 is critical for Render to detect the port correctly
  const port = process.env.PORT || config.get('PORT') || 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`Backend listening on port ${port}`);
}

bootstrap();
