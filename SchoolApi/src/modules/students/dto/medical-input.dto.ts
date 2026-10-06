import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MedicalInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  allergies?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  conditions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
