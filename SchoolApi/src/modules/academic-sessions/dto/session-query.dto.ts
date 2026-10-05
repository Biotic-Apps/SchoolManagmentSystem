import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class SessionQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
