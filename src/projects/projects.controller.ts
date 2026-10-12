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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import {
  AddProjectMemberDto,
  CreateProjectDto,
  ProjectMemberResponseDto,
  ProjectResponseDto,
  UpdateProjectDto,
} from './projects.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List projects owned by the authenticated user' })
  @ApiOkResponse({ type: [ProjectResponseDto], description: 'Projects owned by the current user' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  findAll(@CurrentUser() payload: JwtPayload): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAllForOwner(payload.sub);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
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
  @ApiBearerAuth('access-token')
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

  @Post(':projectId/members')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a member to a project (owner only)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiCreatedResponse({ type: ProjectMemberResponseDto, description: 'Member added' })
  @ApiBadRequestResponse({ description: 'Validation failed or owner cannot be added' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester is not the project owner' })
  @ApiNotFoundResponse({ description: 'Project or user not found' })
  @ApiConflictResponse({ description: 'User is already a member' })
  addMember(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: AddProjectMemberDto,
  ): Promise<ProjectMemberResponseDto> {
    return this.projectsService.addMember(projectId, payload.sub, dto);
  }

  @Get(':projectId/members')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List members of a project (owner only)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiOkResponse({ type: [ProjectMemberResponseDto], description: 'Project members' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester is not the project owner' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findMembers(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectMemberResponseDto[]> {
    return this.projectsService.findMembers(projectId, payload.sub);
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove a member from a project (owner only)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'userId', type: Number, description: 'Member user id', example: 2 })
  @ApiNoContentResponse({ description: 'Member removed' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester is not the project owner' })
  @ApiNotFoundResponse({ description: 'Project or member not found' })
  async removeMember(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.projectsService.removeMember(projectId, payload.sub, userId);
  }
}
