import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { RegisterUserDto, UserResponseDto } from './users.dto.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name, { timestamp: true });

  constructor(private readonly usersRepository: UsersRepository) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      this.logger.warn(`Registration rejected: email already registered (${dto.email})`);
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hash(dto.password, 10);

    try {
      const user = await this.usersRepository.insert({
        name: dto.name,
        email: dto.email,
        password_hash: passwordHash,
      });
      this.logger.log(`User registered: ${user.email} (id=${user.id})`);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        this.logger.warn(`Registration rejected: email already registered (${dto.email})`);
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === '23505';
  }
}
