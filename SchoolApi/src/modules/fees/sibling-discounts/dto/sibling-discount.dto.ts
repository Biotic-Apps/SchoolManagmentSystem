import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateSiblingDiscountDto {
  @IsInt()
  @Min(2)
  @Max(20)
  childIndex!: number;

  /** Whole percent 1–100. */
  @IsInt()
  @Min(1)
  @Max(100)
  percentOff!: number;
}

export class UpdateSiblingDiscountDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  percentOff?: number;
}

export class SiblingDiscountDto {
  id!: string;
  schoolId!: string;
  childIndex!: number;
  percentOff!: number;
  createdAt!: string;
}
