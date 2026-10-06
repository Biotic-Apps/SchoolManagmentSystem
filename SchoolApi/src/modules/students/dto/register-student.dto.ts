import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IsDateOnly } from '../../../core/common/validation/is-date-only';
import { ChildInputDto } from './child-input.dto';
import { PrimaryGuardianInputDto } from './guardian-input.dto';
import { MedicalInputDto } from './medical-input.dto';

/** Direct registration, bypassing admissions. */
export class RegisterStudentDto {
  @ValidateNested()
  @Type(() => ChildInputDto)
  child!: ChildInputDto;

  /** At least one; exactly one `isPrimary`. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => PrimaryGuardianInputDto)
  guardians!: PrimaryGuardianInputDto[];

  @IsUUID()
  sectionId!: string;

  @IsDateOnly()
  admissionDate!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MedicalInputDto)
  medical?: MedicalInputDto;
}
