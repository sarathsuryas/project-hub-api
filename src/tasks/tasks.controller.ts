import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CreateTaskDto, TaskResponseDto } from './tasks.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiBearerAuth()
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
