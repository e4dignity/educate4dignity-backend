import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private jwt: JwtService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.auth.validateUser(body.email, body.password);
    return this.auth.login(user);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const payload = await this.jwt.verifyAsync(body.refreshToken, { secret: process.env.JWT_REFRESH_SECRET! });
    const user = { id: (payload as any).sub, email: (payload as any).email };
    return this.auth.login(user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() req: any) {
    const u = req.user || {};
    return { id: u.userId, email: u.email, roles: u.roles };
  }
}
