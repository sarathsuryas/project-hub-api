import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserDto, UserResponseDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: UserResponseDto, description: 'User created' })
  @ApiBadRequestResponse({
    description: 'Validation failed (name non-empty, valid email, password min 8 chars)',
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterUserDto): Promise<UserResponseDto> {
    return this.usersService.register(dto);
  }
}
