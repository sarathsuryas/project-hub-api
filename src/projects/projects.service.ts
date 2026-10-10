import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from './projects.dto.js';
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

  async update(id: number, ownerId: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    if (dto.name === undefined && dto.description === undefined) {
      throw new BadRequestException('At least one of name or description is required');
    }

    const project = await this.projectsRepository.updateByIdAndOwnerId(id, ownerId, {
      name: dto.name,
      description: dto.description,
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    this.logger.log(`Project updated: id=${id} (owner_id=${ownerId})`);
    return this.toResponse(project);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const deleted = await this.projectsRepository.deleteByIdAndOwnerId(id, ownerId);
    if (!deleted) {
      throw new NotFoundException('Project not found');
    }
    this.logger.log(`Project deleted: id=${id} (owner_id=${ownerId})`);
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
