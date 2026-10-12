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

  async findByIdAndProjectId(id: number, projectId: number): Promise<TaskRow | null> {
    const { rows } = await this.query<TaskRow>(
      'SELECT * FROM tasks WHERE id = $1 AND project_id = $2',
      [id, projectId],
    );
    return rows[0] ?? null;
  }

  async updateByIdAndProjectId(
    id: number,
    projectId: number,
    data: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      assignee_id?: number | null;
      due_date?: Date | null;
    },
  ): Promise<TaskRow | null> {
    const columns = Object.keys(data).filter(
      (column) => data[column as keyof typeof data] !== undefined,
    );
    if (columns.length === 0) {
      return this.findByIdAndProjectId(id, projectId);
    }

    const set = columns.map((column, index) => `"${column}" = $${index + 1}`).join(', ');
    const { rows } = await this.query<TaskRow>(
      `UPDATE tasks
          SET ${set}, updated_at = now()
        WHERE id = $${columns.length + 1} AND project_id = $${columns.length + 2}
        RETURNING *`,
      [...columns.map((column) => data[column as keyof typeof data]), id, projectId],
    );
    return rows[0] ?? null;
  }

  async deleteByIdAndProjectId(id: number, projectId: number): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING id',
      [id, projectId],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
