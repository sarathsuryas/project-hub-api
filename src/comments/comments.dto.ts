import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment text',
    example: 'Schema draft is ready for review',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'Unique comment id', example: 1 })
  id: number;

  @ApiProperty({ description: 'Id of the task the comment belongs to', example: 1 })
  task_id: number;

  @ApiProperty({ description: 'Id of the user who wrote the comment', example: 2 })
  author_id: number;

  @ApiProperty({ description: 'Comment text', example: 'Schema draft is ready for review' })
  body: string;

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
