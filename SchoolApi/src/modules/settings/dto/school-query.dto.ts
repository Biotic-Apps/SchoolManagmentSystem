import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SchoolQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  schoolId!: string;
}
