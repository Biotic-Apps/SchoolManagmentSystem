import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class BranchScopedQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
