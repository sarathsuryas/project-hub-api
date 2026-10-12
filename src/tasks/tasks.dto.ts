import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task', example: 'Design the schema' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Optional description of the task',
    example: 'Draft the initial database schema',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description: 'Task status (defaults to TODO)',
    enum: TASK_STATUSES,
    example: 'TODO',
    required: false,
  })
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Optional id of the user the task is assigned to (must be a project member)',
    example: 2,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  assignee_id?: number | null;

  @ApiProperty({
    description: 'Optional due date',
    type: String,
    format: 'date-time',
    example: '2026-10-20T17:00:00.000Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string | null;
}

export class UpdateTaskDto {
  @ApiProperty({
    description: 'New title of the task',
    example: 'Design the schema',
    required: false,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({
    description: 'New description (set to null to clear)',
    example: 'Draft the initial database schema',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description: 'New status',
    enum: TASK_STATUSES,
    example: 'IN_PROGRESS',
    required: false,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  @ApiProperty({
    description: 'New assignee id, which must be a project member (set to null to unassign)',
    example: 2,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  assignee_id?: number | null;

  @ApiProperty({
    description: 'New due date (set to null to clear)',
    type: String,
    format: 'date-time',
    example: '2026-10-20T17:00:00.000Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string | null;
}

export class AssignTaskDto {
  @ApiProperty({
    description: 'Id of the project member to assign the task to (must be a project member)',
    example: 2,
  })
  @IsInt()
  @Min(1)
  assignee_id: number;
}

export class ListTasksQueryDto {
  @ApiProperty({
    description: 'Filter tasks by status',
    enum: TASK_STATUSES,
    example: 'IN_PROGRESS',
    required: false,
  })
  @IsOptional()
  @IsIn(TASK_STATUSES)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter tasks by assignee id',
    example: 2,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  assignee_id?: number;
}

export class TaskResponseDto {
  @ApiProperty({ description: 'Unique task id', example: 1 })
  id: number;

  @ApiProperty({ description: 'Id of the project the task belongs to', example: 1 })
  project_id: number;

  @ApiProperty({ description: 'Task title', example: 'Design the schema' })
  title: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Draft the initial database schema',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({ description: 'Task status', enum: TASK_STATUSES, example: 'TODO' })
  status: TaskStatus;

  @ApiProperty({
    description: 'Id of the assignee, if any',
    example: 2,
    nullable: true,
    type: Number,
  })
  assignee_id: number | null;

  @ApiProperty({
    description: 'Due date, if any',
    type: String,
    format: 'date-time',
    example: '2026-10-20T17:00:00.000Z',
    nullable: true,
  })
  due_date: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: '2026-10-12T14:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: '2026-10-12T14:30:00.000Z',
  })
  updated_at: Date;
}
