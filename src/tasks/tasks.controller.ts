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
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { AssignTaskDto, CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './tasks.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List tasks of a project (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiOkResponse({ type: [TaskResponseDto], description: 'Project tasks' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  findAll(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll(projectId, payload.sub);
  }

  @Get(':taskId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a task of a project (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiOkResponse({ type: TaskResponseDto, description: 'Task found' })
  @ApiBadRequestResponse({ description: 'Invalid project or task id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  findOne(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(projectId, taskId, payload.sub);
  }

  @Patch(':taskId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a task of a project (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiOkResponse({ type: TaskResponseDto, description: 'Task updated' })
  @ApiBadRequestResponse({
    description: 'Validation failed, empty body, or assignee is not a project member',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  update(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(projectId, taskId, payload.sub, dto);
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a task of a project (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiNoContentResponse({ description: 'Task deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  async remove(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<void> {
    await this.tasksService.remove(projectId, taskId, payload.sub);
  }

  @Patch(':taskId/assignee')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Assign a task to a project member (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiOkResponse({ type: TaskResponseDto, description: 'Task assigned' })
  @ApiBadRequestResponse({ description: 'Validation failed or assignee is not a project member' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  assign(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: AssignTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.assign(projectId, taskId, payload.sub, dto);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a task on a project (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiCreatedResponse({ type: TaskResponseDto, description: 'Task created' })
  @ApiBadRequestResponse({
    description: 'Validation failed or assignee is not a project member',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  create(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(projectId, payload.sub, dto);
  }
}
