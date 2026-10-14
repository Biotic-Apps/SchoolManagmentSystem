import { IsUUID } from 'class-validator';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';

export class ProfitLossQueryDto {
  @IsUUID()
  branchId!: string;

  @IsDateOnly()
  from!: string;

  @IsDateOnly()
  to!: string;
}
