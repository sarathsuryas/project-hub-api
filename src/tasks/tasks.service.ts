import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProjectRow, ProjectsRepository } from '../projects/projects.repository.js';
import { AssignTaskDto, CreateTaskDto, TaskResponseDto, UpdateTaskDto } from './tasks.dto.js';
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
    await this.findAccessibleProject(projectId, requesterId);

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

  async findAll(projectId: number, requesterId: number): Promise<TaskResponseDto[]> {
    await this.findAccessibleProject(projectId, requesterId);

    const tasks = await this.tasksRepository.findByProjectId(projectId);
    return tasks.map((task) => this.toResponse(task));
  }

  async findOne(projectId: number, taskId: number, requesterId: number): Promise<TaskResponseDto> {
    await this.findAccessibleProject(projectId, requesterId);

    const task = await this.tasksRepository.findByIdAndProjectId(taskId, projectId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.toResponse(task);
  }

  async update(
    projectId: number,
    taskId: number,
    requesterId: number,
    dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    await this.findAccessibleProject(projectId, requesterId);

    if (
      dto.title === undefined &&
      dto.description === undefined &&
      dto.status === undefined &&
      dto.assignee_id === undefined &&
      dto.due_date === undefined
    ) {
      throw new BadRequestException('At least one updatable field is required');
    }

    if (dto.assignee_id !== undefined && dto.assignee_id !== null) {
      const isMember = await this.projectsRepository.isMember(projectId, dto.assignee_id);
      if (!isMember) {
        throw new BadRequestException('Assignee must be a member of the project');
      }
    }

    let dueDate: Date | null | undefined;
    if (dto.due_date === undefined) {
      dueDate = undefined;
    } else if (dto.due_date === null) {
      dueDate = null;
    } else {
      dueDate = new Date(dto.due_date);
    }

    const task = await this.tasksRepository.updateByIdAndProjectId(taskId, projectId, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      assignee_id: dto.assignee_id,
      due_date: dueDate,
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.logger.log(`Task updated: id=${taskId} (project_id=${projectId})`);
    return this.toResponse(task);
  }

  async remove(projectId: number, taskId: number, requesterId: number): Promise<void> {
    await this.findAccessibleProject(projectId, requesterId);

    const deleted = await this.tasksRepository.deleteByIdAndProjectId(taskId, projectId);
    if (!deleted) {
      throw new NotFoundException('Task not found');
    }
    this.logger.log(`Task deleted: id=${taskId} (project_id=${projectId})`);
  }

  async assign(
    projectId: number,
    taskId: number,
    requesterId: number,
    dto: AssignTaskDto,
  ): Promise<TaskResponseDto> {
    await this.findAccessibleProject(projectId, requesterId);

    const isMember = await this.projectsRepository.isMember(projectId, dto.assignee_id);
    if (!isMember) {
      throw new BadRequestException('Assignee must be a member of the project');
    }

    const task = await this.tasksRepository.updateByIdAndProjectId(taskId, projectId, {
      assignee_id: dto.assignee_id,
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    this.logger.log(
      `Task assigned: id=${taskId} -> assignee_id=${dto.assignee_id} (project_id=${projectId})`,
    );
    return this.toResponse(task);
  }

  private async findAccessibleProject(projectId: number, requesterId: number): Promise<ProjectRow> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canAccess =
      project.owner_id === requesterId ||
      (await this.projectsRepository.isMember(projectId, requesterId));
    if (!canAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
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
