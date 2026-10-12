import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';

export class WhatsAppQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['SENT', 'FAILED', 'PENDING'] })
  @IsOptional()
  @IsIn(['SENT', 'FAILED', 'PENDING'])
  status?: string;
}
