import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../common/repositories/base.repository.js';
import { PG_POOL } from '../database/database.tokens.js';
import type { TaskStatus } from './tasks.dto.js';

export interface TaskRow extends QueryResultRow {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: number | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TasksRepository extends BaseRepository<TaskRow> {
  protected readonly tableName = 'tasks';

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  async findByProjectId(projectId: number): Promise<TaskRow[]> {
    const { rows } = await this.query<TaskRow>(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId],
    );
    return rows;
  }
}
