import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { IsOptionalDateOnly } from '../../common/validation/is-date-only';

export class AuditQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  entityType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  entityId?: string;

  /** Exact action (`user.create`) or a prefix ending in a dot (`auth.`). */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9_.-]+$/i)
  action?: string;

  @IsOptional()
  @IsUUID()
  actorId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptionalDateOnly()
  from?: string;

  @IsOptionalDateOnly()
  to?: string;
}
