import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const degraded = this.users.isDegraded();
    if (!degraded) {
      const user = await this.users.findByEmail(email);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
      if (!ok) throw new UnauthorizedException('Invalid credentials');
      return user;
    }

    // Degraded mode (no DB): allow a dev admin login for local testing
    const devEmail = process.env.DEV_ADMIN_EMAIL || 'admin@e4d.test';
    const devPass = process.env.DEV_ADMIN_PASSWORD || 'admin123';
    if (email === devEmail && password === devPass) {
      return { id: 'dev-admin', email: devEmail };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const roles = await this.users.getRoles(user.id);
    const payload: { sub: string; email: string; roles: string[] } = { sub: user.id, email: user.email, roles };
  const accessExp = parseInt(process.env.JWT_EXPIRES_IN || '900', 10);
  const refreshExp = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '2592000', 10); // 30d
  const accessToken = await this.jwt.signAsync(payload, { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: accessExp });
  const refreshToken = await this.jwt.signAsync({ sub: user.id } as any, { secret: process.env.JWT_REFRESH_SECRET!, expiresIn: refreshExp });
    return { accessToken, refreshToken };
  }
}
