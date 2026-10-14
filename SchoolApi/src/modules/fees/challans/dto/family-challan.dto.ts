import { IsArray, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class FamilyChallanDto {
  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsUUID()
  guardianId?: string;

  @ValidateIf((o: FamilyChallanDto) => !o.guardianId)
  @IsArray()
  @IsUUID('all', { each: true })
  studentIds?: string[];
}
