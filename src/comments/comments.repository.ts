import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../common/repositories/base.repository.js';
import { PG_POOL } from '../database/database.tokens.js';

export interface CommentRow extends QueryResultRow {
  id: number;
  task_id: number;
  author_id: number;
  body: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class CommentsRepository extends BaseRepository<CommentRow> {
  protected readonly tableName = 'task_comments';

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  async findByTaskId(taskId: number): Promise<CommentRow[]> {
    const { rows } = await this.query<CommentRow>(
      'SELECT * FROM task_comments WHERE task_id = $1 ORDER BY created_at ASC, id ASC',
      [taskId],
    );
    return rows;
  }
}
