import { Inject } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { PG_POOL } from '../../database/database.tokens.js';

const IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]*$/;

export abstract class BaseRepository<T extends QueryResultRow> {
  protected abstract readonly tableName: string;

  constructor(@Inject(PG_POOL) protected readonly pool: Pool) {}

  async findAll(): Promise<T[]> {
    const { rows } = await this.pool.query<T>(`SELECT * FROM ${this.table}`);
    return rows;
  }

  async findById(id: string | number): Promise<T | null> {
    const { rows } = await this.pool.query<T>(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async insert(data: Partial<T>): Promise<T> {
    const columns = this.columnsOf(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const { rows } = await this.pool.query<T>(
      `INSERT INTO ${this.table} (${this.quoted(columns)}) VALUES (${placeholders}) RETURNING *`,
      columns.map((column) => data[column]),
    );
    return rows[0];
  }

  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    const columns = this.columnsOf(data);
    const set = columns.map((column, index) => `"${column}" = $${index + 1}`).join(', ');
    const { rows } = await this.pool.query<T>(
      `UPDATE ${this.table} SET ${set} WHERE id = $${columns.length + 1} RETURNING *`,
      [...columns.map((column) => data[column]), id],
    );
    return rows[0] ?? null;
  }

  async delete(id: string | number): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM ${this.table} WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  protected async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  private get table(): string {
    return this.assertIdentifier(this.tableName);
  }

  private columnsOf(data: Partial<T>): string[] {
    const columns = Object.keys(data);
    if (columns.length === 0) {
      throw new Error('At least one column is required');
    }
    return columns.map((column) => this.assertIdentifier(column));
  }

  private assertIdentifier(identifier: string): string {
    if (!IDENTIFIER_PATTERN.test(identifier)) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }
    return identifier;
  }

  private quoted(columns: string[]): string {
    return columns.map((column) => `"${column}"`).join(', ');
  }
}
