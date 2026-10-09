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
}
