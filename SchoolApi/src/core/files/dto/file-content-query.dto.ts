import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength } from 'class-validator';

export class FileContentQueryDto {
  @Type(() => Number)
  @IsInt()
  exp!: number;

  @IsString()
  @MaxLength(100)
  sig!: string;
}
