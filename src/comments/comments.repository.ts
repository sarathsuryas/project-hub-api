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

  // TODO(you): return the comment with this id, but only if it belongs to this task.
  //   params: $1 = id, $2 = taskId
  //   result: the full row, or no rows if it doesn't exist / belongs to another task
  async findByIdAndTaskId(id: number, taskId: number): Promise<CommentRow | null> {
    const { rows } = await this.query<CommentRow>('SELECT * FROM task_comments WHERE id = $1 AND task_id = $2', [id, taskId]);
    return rows[0] ?? null;
  }

  // TODO(you): set the comment's body to the new text, bump updated_at, return the updated row.
  //   params: $1 = id, $2 = body
  //   result: the full updated row (RETURNING), or no rows if the id doesn't exist
  async updateBody(id: number, body: string): Promise<CommentRow | null> {
    const { rows } = await this.query<CommentRow>('UPDATE task_comments SET body = $2,updated_at = NOW() WHERE id = $1 RETURNING *', [id, body]);
    return rows[0] ?? null;
  }

  // TODO(you): delete the comment with this id, but only if it belongs to this task.
  //   params: $1 = id, $2 = taskId
  //   result: true if a row was deleted, false otherwise (checked via rowCount below)
  async deleteByIdAndTaskId(id: number, taskId: number): Promise<boolean> {
    const result = await this.query('DELETE FROM task_comments WHERE id = $1 AND task_id = $2 RETURNING *', [id, taskId]);
    return (result.rowCount ?? 0) > 0;
  }
}
