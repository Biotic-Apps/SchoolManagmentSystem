import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';
import { BranchTimingsInput } from './branch-timings.input';

export class BranchContactFields {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BranchTimingsInput)
  timings?: BranchTimingsInput;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(7)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  workingDays?: number[];
}

export class CreateBranchDto extends BranchContactFields {
  @IsUUID()
  schoolId!: string;

  @Matches(/^[A-Z0-9]{2,12}$/, {
    message: 'code must be 2-12 uppercase letters or digits',
  })
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;
}
