import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Name of the project', example: 'E-commerce Platform' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Optional description of the project',
    example: 'Build an e-commerce application',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiProperty({
    description: 'New name of the project',
    example: 'E-commerce Platform',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'New description of the project',
    example: 'Build an e-commerce application',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}

export class ProjectResponseDto {
  @ApiProperty({ description: 'Unique project id', example: 1 })
  id: number;

  @ApiProperty({ description: 'Project name', example: 'E-commerce Platform' })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Build an e-commerce application',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({ description: 'Id of the owning user', example: 1 })
  owner_id: number;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
    example: '2026-10-09T14:30:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
    example: '2026-10-09T14:30:00.000Z',
  })
  updated_at: Date;
}
