import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateSchoolDto } from '../../schools/dto/create-school.dto';
import { SetupAcademicsInput } from './setup-academics.input';
import { SetupBranchInput } from './setup-branch.input';
import { SetupPrincipalInput } from './setup-principal.input';

/** POST /schools/setup — school-setup-contract §1. */
export class SchoolSetupDto {
  @ValidateNested()
  @Type(() => CreateSchoolDto)
  school!: CreateSchoolDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SetupBranchInput)
  branch?: SetupBranchInput;

  @ValidateNested()
  @Type(() => SetupPrincipalInput)
  principal!: SetupPrincipalInput;

  @IsOptional()
  @ValidateNested()
  @Type(() => SetupAcademicsInput)
  academics?: SetupAcademicsInput;
}
