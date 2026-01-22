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
  // 1. CORS - DOIT ÊTRE INITIALISÉ EN PREMIER
  // ======================================================
  const allowedOrigins = [
    'https://e4dignity.org',
    'https://www.e4dignity.org',
    'https://educate4dignity-frontend.onrender.com',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Autorise les requêtes sans origin (comme Postman ou les outils serveurs)
      // ou si l'origine est dans la liste autorisée
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
  // 2. MIDDLEWARES DE SÉCURITÉ
  // ======================================================
  // Configuration spécifique de Helmet pour ne pas bloquer le Cross-Origin
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ======================================================
  // 3. CONFIGURATION GLOBALE
  // ======================================================
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidUnknownValues: false,
  }));

  // ======================================================
  // 4. MÉTRIQUES & PROMETHEUS
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
  // 5. DÉMARRAGE DU SERVEUR
  // ======================================================
  const config = app.get(ConfigService);
  
  // Important pour Render : écouter sur 0.0.0.0
  const port = process.env.PORT || config.get('PORT') || 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();
