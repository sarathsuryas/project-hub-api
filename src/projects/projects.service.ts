import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProjectDto, ProjectResponseDto } from './projects.dto.js';
import { ProjectRow, ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name, { timestamp: true });

  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async create(ownerId: number, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.insert({
      name: dto.name,
      description: dto.description ?? null,
      owner_id: ownerId,
    });
    this.logger.log(`Project created: ${project.name} (id=${project.id}, owner_id=${ownerId})`);
    return this.toResponse(project);
  }

  async findAllForOwner(ownerId: number): Promise<ProjectResponseDto[]> {
    const projects = await this.projectsRepository.findByOwnerId(ownerId);
    return projects.map((project) => this.toResponse(project));
  }

  async findOneForOwner(id: number, ownerId: number): Promise<ProjectResponseDto> {
    const project = await this.projectsRepository.findByIdAndOwnerId(id, ownerId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.toResponse(project);
  }

  private toResponse(project: ProjectRow): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      owner_id: project.owner_id,
      created_at: project.created_at,
      updated_at: project.updated_at,
    };
  }
}
