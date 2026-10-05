import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @Matches(/^[A-Z0-9_-]{1,12}$/, {
    message: 'code must be 1-12 uppercase letters, digits, _ or -',
  })
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;
}
