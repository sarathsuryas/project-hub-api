import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserResponseDto } from '../users/users.dto.js';

export interface JwtPayload {
  sub: number;
  email: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token, send as "Authorization: Bearer <token>"',
    example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjF9.abc123',
  })
  access_token: string;

  @ApiProperty({ description: 'Authenticated user', type: () => UserResponseDto })
  user: UserResponseDto;
}
