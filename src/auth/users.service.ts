import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  isDegraded() {
    return !!(this.prisma as any).__degraded;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } }).catch((_e)=>{
      // Degraded (no-DB) mode: behave as if user not found; AuthService handles fallback
      return null as any;
    });
  }
  getRoles(userId: string) {
    if (this.isDegraded()) {
      // Degraded (no-DB) mode: grant ADMIN role to dev admin, otherwise empty
      return Promise.resolve(userId === 'dev-admin' ? ['ADMIN'] : []);
    }
    return this.prisma.userRole
      .findMany({ where: { userId }, select: { roleName: true } })
      .then((r) => r.map((x) => x.roleName));
  }
}
