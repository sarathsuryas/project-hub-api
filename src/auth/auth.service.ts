import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersRepository } from '../users/users.repository.js';
import { JwtPayload, LoginDto, LoginResponseDto } from './auth.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findByEmail(dto.email);
    const passwordValid = user ? await compare(dto.password, user.password_hash) : false;

    if (!user || !passwordValid) {
      this.logger.warn(`Login rejected: invalid credentials (${dto.email})`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);
    this.logger.log(`User logged in: ${user.email} (id=${user.id})`);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    };
  }
}
