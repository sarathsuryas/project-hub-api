import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { PG_POOL } from './database.tokens.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name, { timestamp: true });

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('PostgreSQL connection established');
    } catch (error) {
      this.logger.error(
        'PostgreSQL connection failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Failed to connect to PostgreSQL', { cause: error });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  async transaction<R>(fn: (client: PoolClient) => Promise<R>): Promise<R> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.warn(
        `Transaction rolled back: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    } finally {
      client.release();
    }
  }
}
