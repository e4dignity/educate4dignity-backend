import { BadRequestException, Body, Controller, Headers, NotFoundException, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Controller('dev')
export class DevController {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  @Post('token')
  async token() {
    // Allow in non-production environments. For convenience during local
    // testing we also allow issuance when DEV_ALLOW_TOKEN=1 is set so a
    // developer can enable the endpoint without switching NODE_ENV.
    if (process.env.NODE_ENV === 'production' && process.env.DEV_ALLOW_TOKEN !== '1') {
      throw new NotFoundException();
    }

    const payload = { sub: 'dev-admin', email: 'admin@e4d.test', roles: ['ADMIN'] } as any;
    const accessExp = parseInt(process.env.JWT_EXPIRES_IN || '900', 10);
    const refreshExp = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '2592000', 10);
    const accessToken = await this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: accessExp });
    const refreshToken = await this.jwt.signAsync({ sub: payload.sub } as any, { secret: process.env.JWT_REFRESH_SECRET!, expiresIn: refreshExp });
    return { accessToken, refreshToken };
  }

  @Post('seed-admin')
  async seedAdmin(@Headers('x-seed-secret') secret: string, @Body() body: { email: string; password: string; name?: string }) {
    if (!process.env.DEV_SEED_SECRET || secret !== process.env.DEV_SEED_SECRET) {
      throw new BadRequestException('Invalid secret');
    }
    const exists = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return { ok: true, already: true };
    const hash = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({ data: { email: body.email, passwordHash: hash, name: body.name ?? null } });
    await this.prisma.userRole.create({ data: { userId: user.id, roleName: 'ADMIN' as any } });
    return { ok: true, userId: user.id };
  }

  // Disabled - models not in current schema
  /*
  @Post('seed-sample')
  async seedSample(@Headers('x-seed-secret') secret: string) {
    if (!process.env.DEV_SEED_SECRET || secret !== process.env.DEV_SEED_SECRET) {
      throw new BadRequestException('Invalid secret');
    }
    // Ensure at least one project and one activity exist for finances page
    let project = await this.prisma.project.findFirst();
    if (!project) {
      project = await this.prisma.project.create({
        data: {
          id: 'DTEST1',
          name: 'Dignity Pilot',
          shortDescription: 'Seeded project for E2E tests',
          type: 'TRAINING',
          organisation: 'E4D',
          location: 'Burundi',
          start: new Date(),
          status: 'ACTIVE',
          budget: 10000,
          collected: 0,
          spent: 0,
          operators: [],
        },
      });
    }
    let activity = await this.prisma.activity.findFirst({ where: { projectId: project.id } });
    if (!activity) {
      activity = await this.prisma.activity.create({
        data: {
          projectId: project.id,
          title: 'Community Training',
          description: 'Seeded activity',
          status: 'IN_PROGRESS',
          startDate: new Date(),
        },
      });
    }
    return { project, activity };
  }
  */
}
