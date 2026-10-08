import { Inject, Injectable } from '@nestjs/common';
import { Pool, QueryResultRow } from 'pg';
import { BaseRepository } from '../common/repositories/base.repository.js';
import { PG_POOL } from '../database/database.tokens.js';

export interface UserRow extends QueryResultRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository extends BaseRepository<UserRow> {
  protected readonly tableName = 'users';

  constructor(@Inject(PG_POOL) pool: Pool) {
    super(pool);
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await this.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] ?? null;
  }
}
