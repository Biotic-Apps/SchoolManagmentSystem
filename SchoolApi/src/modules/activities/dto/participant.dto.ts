import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ParticipantInputDto {
  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  result?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}

export class ParticipantsInputDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ParticipantInputDto)
  participants!: ParticipantInputDto[];
}

export class ParticipantDto {
  studentId!: string;
  studentName!: string;
  role!: string | null;
  result!: string | null;
  position!: number | null;
  remarks!: string | null;
}

export class ParticipantsDto {
  participants!: ParticipantDto[];
}
