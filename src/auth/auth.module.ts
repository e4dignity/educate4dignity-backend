import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const exp = parseInt(cfg.get<string>('JWT_EXPIRES_IN') || '900', 10);
        return {
          secret: cfg.get<string>('JWT_ACCESS_SECRET') || 'change-me',
          signOptions: { expiresIn: exp },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, UsersService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
