import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class StudentQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;
}
