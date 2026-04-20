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
import { AuthResponse, AuthTokens, SafeUser } from './auth.types';

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

  async register(dto: RegisterDto): Promise<AuthResponse> {
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

    return {
      message: 'Registration successful',
      data: { user: this.sanitizeUser(user), ...tokens },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive)
      throw new UnauthorizedException('Account is deactivated');

    const isPasswordValid = await user.validatePassword(dto.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Login successful',
      data: { user: this.sanitizeUser(user), ...tokens },
    };
  }

  async logout(userId: string): Promise<{ message: string; data: null }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logout successful', data: null };
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);
    if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = { sub: user.id, email: user.email };

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

  async refreshTokens(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Tokens refreshed',
      data: tokens,
    };
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
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
