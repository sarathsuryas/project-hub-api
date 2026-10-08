import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseService } from './database.service.js';
import { PG_POOL } from './database.tokens.js';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: (config: ConfigService) =>
        new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
      inject: [ConfigService],
    },
    DatabaseService,
  ],
  exports: [PG_POOL, DatabaseService], 
})
export class DatabaseModule {}
