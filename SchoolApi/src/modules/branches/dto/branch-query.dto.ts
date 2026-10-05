import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class BranchQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;
}
