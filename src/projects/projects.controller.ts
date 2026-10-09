import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List projects owned by the authenticated user' })
  @ApiOkResponse({ type: [ProjectResponseDto], description: 'Projects owned by the current user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  findAll(@CurrentUser() payload: JwtPayload): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAllForOwner(payload.sub);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a project owned by the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Project id', example: 1 })
  @ApiOkResponse({ type: ProjectResponseDto, description: 'Project found' })
  @ApiBadRequestResponse({ description: 'Invalid project id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findOne(
    @CurrentUser() payload: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOneForOwner(id, payload.sub);
  }

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
