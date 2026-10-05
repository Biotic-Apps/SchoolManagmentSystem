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

export class CreateSectionDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(200)
  capacity!: number;

  @IsOptional()
  @IsUUID()
  roomId?: string;
}
