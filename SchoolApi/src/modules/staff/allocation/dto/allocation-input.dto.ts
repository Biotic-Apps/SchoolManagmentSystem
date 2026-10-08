import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class SetTeacherDto {
  /** null removes the current teacher. */
  @IsOptional()
  @IsUUID()
  staffId!: string | null;
}

export class TeachingStaffQueryDto {
  /** Defaults to the branch's active session. */
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  /** true = every active staff member (not only teaching staff). */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  all?: boolean;
}
