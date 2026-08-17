import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'TENANT',
      },
    });

    return this.buildTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.active) {
      throw new UnauthorizedException('Compte désactivé');
    }

    return this.buildTokens(user.id, user.email, user.role);
  }

  async guest() {
    const guestId = `guest-${randomUUID()}`;
    const accessToken = await this.jwt.signAsync(
      { sub: guestId, email: undefined, role: 'GUEST', isGuest: true },
      { expiresIn: this.config.get('JWT_EXPIRES_IN') || '1d' },
    );
    return {
      accessToken,
      refreshToken: null,
      user: {
        id: guestId,
        email: null,
        role: 'GUEST',
        isGuest: true,
      },
    };
  }

  async refresh(dto: RefreshDto) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: true },
    });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const user = stored.user;
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.buildTokens(user.id, user.email, user.role);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    const { password: _pw, ...safe } = user;
    return safe;
  }

  private async buildTokens(
    userId: string,
    email: string,
    role: string,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN') || '1d',
    });

    const refreshToken = await this.jwt.signAsync(
      payload,
      {
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        jwtid: randomUUID(),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { password: _pw, ...safe } = user!;

    return { accessToken, refreshToken, user: safe };
  }
}