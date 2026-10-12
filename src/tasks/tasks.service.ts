import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsRepository } from '../projects/projects.repository.js';
import { CreateTaskDto, TaskResponseDto } from './tasks.dto.js';
import { TaskRow, TasksRepository } from './tasks.repository.js';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name, { timestamp: true });

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(
    projectId: number,
    requesterId: number,
    dto: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.owner_id === requesterId;
    const canAccess = isOwner || (await this.projectsRepository.isMember(projectId, requesterId));
    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    if (dto.assignee_id !== undefined && dto.assignee_id !== null) {
      const isMember = await this.projectsRepository.isMember(projectId, dto.assignee_id);
      if (!isMember) {
        throw new BadRequestException('Assignee must be a member of the project');
      }
    }

    const task = await this.tasksRepository.insert({
      project_id: projectId,
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? 'TODO',
      assignee_id: dto.assignee_id ?? null,
      due_date: dto.due_date ? new Date(dto.due_date) : null,
    });
    this.logger.log(`Task created: ${task.title} (id=${task.id}, project_id=${projectId})`);
    return this.toResponse(task);
  }

  private toResponse(task: TaskRow): TaskResponseDto {
    return {
      id: task.id,
      project_id: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status,
      assignee_id: task.assignee_id,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }
}
