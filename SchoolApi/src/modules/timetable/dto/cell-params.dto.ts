import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CellParamsDto {
  @IsUUID()
  sectionId!: string;

  /** ISO weekday 1 = Monday … 7 = Sunday. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  day!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  periodIndex!: number;
}
