import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateProjectDto, ProjectResponseDto } from './projects.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a project owned by the authenticated user' })
  @ApiCreatedResponse({ type: ProjectResponseDto, description: 'Project created' })
  @ApiBadRequestResponse({ description: 'Validation failed (name required)' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  create(
    @CurrentUser() payload: JwtPayload,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(payload.sub, dto);
  }
}
