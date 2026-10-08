import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/auth.dto.js';
import { Public } from '../auth/public.decorator.js';
import { RegisterUserDto, UserResponseDto } from './users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
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

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Current user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  me(@CurrentUser() payload: JwtPayload): Promise<UserResponseDto> {
    return this.usersService.me(payload.sub);
  }
}
