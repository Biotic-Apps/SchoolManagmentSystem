import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export class WhatsAppQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['SENT', 'FAILED', 'PENDING'] })
  @IsOptional()
  @IsIn(['SENT', 'FAILED', 'PENDING'])
  status?: string;

  /** Limit the log to one school (must be in the caller's scope). Unset = every school the caller can read. */
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}
