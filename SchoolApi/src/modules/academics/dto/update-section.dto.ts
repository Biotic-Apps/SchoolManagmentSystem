import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  capacity?: number;

  @IsOptional()
  @IsUUID()
  roomId?: string;

  /** Matric group, e.g. "Science" / "Arts"; null or blank = no group. */
  @IsOptional()
  @IsString()
  @MaxLength(30)
  group?: string | null;
}
