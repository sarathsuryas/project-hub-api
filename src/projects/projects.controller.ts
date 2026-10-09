import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from './projects.dto.js';
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

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a project owned by the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Project id', example: 1 })
  @ApiOkResponse({ type: ProjectResponseDto, description: 'Project updated' })
  @ApiBadRequestResponse({ description: 'Validation failed or empty body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  update(
    @CurrentUser() payload: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, payload.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a project owned by the authenticated user' })
  @ApiParam({ name: 'id', type: Number, description: 'Project id', example: 1 })
  @ApiNoContentResponse({ description: 'Project deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  async remove(
    @CurrentUser() payload: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.projectsService.remove(id, payload.sub);
  }
}
