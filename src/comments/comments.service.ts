import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service.js';
import { CommentResponseDto, CreateCommentDto, UpdateCommentDto } from './comments.dto.js';
import { CommentRow, CommentsRepository } from './comments.repository.js';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name, { timestamp: true });

  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly tasksService: TasksService,
  ) {}

  async create(
    projectId: number,
    taskId: number,
    requesterId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.tasksService.findAccessibleTask(projectId, taskId, requesterId);

    const comment = await this.commentsRepository.insert({
      task_id: taskId,
      author_id: requesterId,
      body: dto.body,
    });
    this.logger.log(
      `Comment created: id=${comment.id} (task_id=${taskId}, project_id=${projectId})`,
    );
    return this.toResponse(comment);
  }

  async findAll(
    projectId: number,
    taskId: number,
    requesterId: number,
  ): Promise<CommentResponseDto[]> {
    await this.tasksService.findAccessibleTask(projectId, taskId, requesterId);

    const comments = await this.commentsRepository.findByTaskId(taskId);
    return comments.map((comment) => this.toResponse(comment));
  }

  async update(
    projectId: number,
    taskId: number,
    commentId: number,
    requesterId: number,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.tasksService.findAccessibleTask(projectId, taskId, requesterId);

    const comment = await this.commentsRepository.findByIdAndTaskId(commentId, taskId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (comment.author_id !== requesterId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.commentsRepository.updateBody(commentId, dto.body);
    if (!updated) {
      throw new NotFoundException('Comment not found');
    }
    this.logger.log(
      `Comment updated: id=${commentId} (task_id=${taskId}, project_id=${projectId})`,
    );
    return this.toResponse(updated);
  }

  private toResponse(comment: CommentRow): CommentResponseDto {
    return {
      id: comment.id,
      task_id: comment.task_id,
      author_id: comment.author_id,
      body: comment.body,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };
  }
}
