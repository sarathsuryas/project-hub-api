import { Injectable, Logger } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service.js';
import { CommentResponseDto, CreateCommentDto } from './comments.dto.js';
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
