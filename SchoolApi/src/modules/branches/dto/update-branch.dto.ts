import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BranchContactFields } from './create-branch.dto';

export class UpdateBranchDto extends BranchContactFields {
  @IsOptional()
  @Matches(/^[A-Z0-9]{2,12}$/, {
    message: 'code must be 2-12 uppercase letters or digits',
  })
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;
}
