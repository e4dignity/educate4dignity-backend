import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donor } from '../src/donations/donor.entity';
import { Donation } from '../src/donations/donation.entity';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../src/auth/roles.guard';

async function bootstrap() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.DB_DRIVER = process.env.DB_DRIVER || 'sqlite';
  process.env.SQLITE_DB = process.env.SQLITE_DB || 'e4d.sqlite';

  const mockPrisma: Partial<PrismaService> = {
    project: {
      count: async () => 1,
      findMany: async () => [],
    } as any,
    expense: { findMany: async () => [] } as any,
    report: { findMany: async () => [] } as any,
    beneficiary: { aggregate: async () => ({ _sum: { females: 0, males: 0 } }) } as any,
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(mockPrisma)
    // Disable auth guards
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    skipMissingProperties: true,
    forbidUnknownValues: false,
  }));
  try { app.useGlobalGuards(app.get(ThrottlerGuard)); } catch {}
  await app.init();

  const donorRepo = app.get<Repository<Donor>>(getRepositoryToken(Donor));
  const donationRepo = app.get<Repository<Donation>>(getRepositoryToken(Donation));

  // Seed a donor + donation
  const donor = donorRepo.create({ email: 'alice@example.com', firstName: 'Alice', lastName: 'Tester', anonymous: false, country: 'US' });
  await donorRepo.save(donor);
  const donation = donationRepo.create({ donor, amountCents: 2500, currency: 'usd', donationType: 'one-time' as any, projectId: 'GEN', status: 'COMPLETE' as any, createdAt: new Date(), completedAt: new Date() });
  await donationRepo.save(donation);

  // Donors list should include Alice with totalDonated >= 25
  const list = await request(app.getHttpServer()).get('/api/admin/donors').expect(200);
  if (!Array.isArray(list.body) || !list.body.find((r: any) => r.email === 'alice@example.com' && r.donationsCount >= 1 && r.totalDonated >= 25)) {
    throw new Error('admin donors list missing expected donor');
  }

  // Donor profile should include 1 donation
  const id = list.body.find((r: any) => r.email === 'alice@example.com').id;
  const prof = await request(app.getHttpServer()).get(`/api/admin/donors/${id}`).expect(200);
  if (!prof.body?.donor?.email || !Array.isArray(prof.body?.donations) || prof.body.donations.length < 1) {
    throw new Error('donor profile invalid');
  }

  // Finances overview should reflect total
  const overview = await request(app.getHttpServer()).get('/api/admin/finances/overview').expect(200);
  if ((overview.body?.total || 0) < 25) {
    throw new Error('finances overview total too low');
  }

  await app.close();
}

bootstrap().then(() => console.log('SMOKE DONATIONS ADMIN OK')).catch((e) => { console.error(e); process.exit(1); });
