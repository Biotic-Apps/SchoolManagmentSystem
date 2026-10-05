import { IsOptional, IsUUID } from 'class-validator';
import { BranchScopedQueryDto } from './branch-scoped-query.dto';

export class SectionQueryDto extends BranchScopedQueryDto {
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsUUID()
  classId?: string;
}
