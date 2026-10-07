import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BranchContactFields } from '../../branches/dto/create-branch.dto';

/** Main branch; name/code/timings/workingDays fall back to the setup defaults. */
export class SetupBranchInput extends BranchContactFields {
  /** Default "Main Branch". */
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  /** Default "MAIN". */
  @IsOptional()
  @Matches(/^[A-Z0-9]{2,12}$/, {
    message: 'code must be 2-12 uppercase letters or digits',
  })
  code?: string;
}
