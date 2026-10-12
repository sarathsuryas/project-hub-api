import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../common/repositories/base.repository.js';
import { PG_POOL } from '../database/database.tokens.js';

export interface ProjectRow extends QueryResultRow {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectMemberRow extends QueryResultRow {
  project_id: number;
  user_id: number;
  role: 'OWNER' | 'MEMBER';
  joined_at: Date;
}

@Injectable()
export class ProjectsRepository extends BaseRepository<ProjectRow> {
  protected readonly tableName = 'projects';

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  async findByOwnerId(ownerId: number): Promise<ProjectRow[]> {
    const { rows } = await this.query<ProjectRow>(
      'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId],
    );
    return rows;
  }

  async findByIdAndOwnerId(id: number, ownerId: number): Promise<ProjectRow | null> {
    const { rows } = await this.query<ProjectRow>(
      'SELECT * FROM projects WHERE id = $1 AND owner_id = $2',
      [id, ownerId],
    );
    return rows[0] ?? null;
  }

  async updateByIdAndOwnerId(
    id: number,
    ownerId: number,
    data: { name?: string; description?: string | null },
  ): Promise<ProjectRow | null> {
    const { rows } = await this.query<ProjectRow>(
      `UPDATE projects
          SET
            name        = COALESCE($1, name),
            description = COALESCE($2, description),
            updated_at  = now()
        WHERE id = $3 AND owner_id = $4
        RETURNING id, name, description, owner_id, created_at, updated_at`,
      [data.name ?? null, data.description ?? null, id, ownerId],
    );
    return rows[0] ?? null;
  }

  async deleteByIdAndOwnerId(id: number, ownerId: number): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING id`,
      [id, ownerId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async isMember(projectId: number, userId: number): Promise<boolean> {
    const { rows } = await this.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, userId],
    );
    return rows.length > 0;
  }

  async findMembersByProjectId(projectId: number): Promise<ProjectMemberRow[]> {
    const { rows } = await this.query<ProjectMemberRow>(
      `SELECT project_id, user_id, role, joined_at
         FROM project_members
        WHERE project_id = $1
        ORDER BY joined_at ASC`,
      [projectId],
    );
    return rows;
  }

  async insertMember(projectId: number, userId: number): Promise<ProjectMemberRow> {
    const { rows } = await this.query<ProjectMemberRow>(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING project_id, user_id, role, joined_at`,
      [projectId, userId, 'MEMBER'],
    );
    return rows[0];
  }

  async deleteMember(projectId: number, userId: number): Promise<boolean> {
    const result = await this.query(
      `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING user_id`,
      [projectId, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
