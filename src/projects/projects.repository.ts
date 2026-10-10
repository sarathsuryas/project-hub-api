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
}
