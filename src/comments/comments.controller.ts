import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from '../auth/auth.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from './comments.dto.js';
import { CommentsService } from './comments.service.js';

@ApiTags('comments')
@Controller('projects/:projectId/tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List comments of a task, oldest first (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiOkResponse({ type: [CommentResponseDto], description: 'Task comments' })
  @ApiBadRequestResponse({ description: 'Invalid project or task id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  findAll(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findAll(projectId, taskId, payload.sub);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Add a comment to a task (owner or member)' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiCreatedResponse({ type: CommentResponseDto, description: 'Comment created' })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid project/task id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Requester has no access to the project' })
  @ApiNotFoundResponse({ description: 'Project or task not found' })
  create(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(projectId, taskId, payload.sub, dto);
  }

  @Patch(':commentId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Edit your own comment on a task' })
  @ApiParam({ name: 'projectId', type: Number, description: 'Project id', example: 1 })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task id', example: 1 })
  @ApiParam({ name: 'commentId', type: Number, description: 'Comment id', example: 1 })
  @ApiOkResponse({ type: CommentResponseDto, description: 'Comment updated' })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid id' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({
    description: 'Requester has no access to the project or is not the comment author',
  })
  @ApiNotFoundResponse({ description: 'Project, task, or comment not found' })
  update(
    @CurrentUser() payload: JwtPayload,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(projectId, taskId, commentId, payload.sub, dto);
  }
}
