import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class UserQueryDto extends ListQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  role?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}
