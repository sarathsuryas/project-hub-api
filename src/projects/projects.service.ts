import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository.js';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  ProjectMemberResponseDto,
  ProjectResponseDto,
  UpdateProjectDto,
} from './projects.dto.js';
import { ProjectMemberRow, ProjectRow, ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name, { timestamp: true });

  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

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

  async addMember(
    projectId: number,
    requesterId: number,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberResponseDto> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.owner_id !== requesterId) {
      throw new ForbiddenException('Only the project owner can add members');
    }
    if (dto.userId === project.owner_id) {
      throw new BadRequestException('The project owner is already part of the project');
    }

    const user = await this.usersRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const alreadyMember = await this.projectsRepository.isMember(projectId, dto.userId);
    if (alreadyMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.projectsRepository.insertMember(projectId, dto.userId);
    this.logger.log(`Member added: project_id=${projectId}, user_id=${dto.userId}`);
    return this.toMemberResponse(member);
  }

  async findMembers(projectId: number, requesterId: number): Promise<ProjectMemberResponseDto[]> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.owner_id !== requesterId) {
      throw new ForbiddenException('Only the project owner can view members');
    }

    const members = await this.projectsRepository.findMembersByProjectId(projectId);
    return members.map((member) => this.toMemberResponse(member));
  }

  async removeMember(projectId: number, requesterId: number, userId: number): Promise<void> {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.owner_id !== requesterId) {
      throw new ForbiddenException('Only the project owner can remove members');
    }

    const deleted = await this.projectsRepository.deleteMember(projectId, userId);
    if (!deleted) {
      throw new NotFoundException('Member not found');
    }
    this.logger.log(`Member removed: project_id=${projectId}, user_id=${userId}`);
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

  private toMemberResponse(member: ProjectMemberRow): ProjectMemberResponseDto {
    return {
      project_id: member.project_id,
      user_id: member.user_id,
      role: member.role,
      joined_at: member.joined_at,
    };
  }
}
