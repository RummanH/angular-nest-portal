import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { AuthTokens, SafeUser } from './auth.types';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: StringValue;
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpiresIn: StringValue;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('jwt.secret');
    this.jwtExpiresIn =
      this.configService.getOrThrow<StringValue>('jwt.expiresIn');
    this.jwtRefreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    this.jwtRefreshExpiresIn = this.configService.getOrThrow<StringValue>(
      'jwt.refreshExpiresIn',
    );
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const exists = await this.usersService.emailExists(dto.email);
    if (exists) throw new ConflictException('Email already registered');

    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
    });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: this.sanitizeUser(user) };
  }

  async login(dto: LoginDto): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive)
      throw new UnauthorizedException('Account is deactivated');

    const isPasswordValid = await user.validatePassword(dto.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user: this.sanitizeUser(user) };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // User already verified by JwtRefreshStrategy — just rotate tokens
  async refresh(user: User): Promise<AuthTokens> {
    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: this.jwtExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.usersService.updateRefreshToken(userId, hashed);
  }

  private sanitizeUser(user: User): SafeUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
