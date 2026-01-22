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
  // Allowed CORS origins
  // ==============================
  const allowedOrigins = [
    'https://e4dignity.org',                   // production frontend
    'https://www.e4dignity.org',              // production frontend
    'https://educate4dignity-frontend.onrender.com', // internal frontend for tests
  ];

  // ==============================
  // Enable CORS
  // ==============================
  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl / server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD'],
    allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
    preflightContinue: false,
  });

  // ==============================
  // Middleware global OPTIONS
  // ==============================
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin as string || '');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.sendStatus(204);
    }
    next();
  });

  // ==============================
  // Global API prefix
  // ==============================
  app.setGlobalPrefix('api');

  // ==============================
  // Validation pipe global
  // ==============================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      skipMissingProperties: true,
      forbidUnknownValues: false,
    }),
  );

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
  console.log(`Backend listening on port ${port}`);
}

bootstrap();
