import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Display name of the user', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address (trimmed and lowercased before validation)',
    example: 'jane.doe@example.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password, at least 8 characters',
    example: 'secret123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'Unique user id', example: 1 })
  id: number;

  @ApiProperty({ description: 'Display name', example: 'Jane Doe' })
  name: string;

  @ApiProperty({ description: 'Email address', example: 'jane.doe@example.com' })
  email: string;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: '2026-10-08T14:30:00.000Z',
  })
  created_at: Date;
}
