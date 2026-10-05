import {
  IsInt,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateClassDto {
  @IsUUID()
  schoolId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  levelOrder!: number;
}
