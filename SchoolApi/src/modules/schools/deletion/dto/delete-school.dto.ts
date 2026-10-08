import { IsString, MaxLength } from 'class-validator';

export class DeleteSchoolDto {
  /** Must equal the school's code (typed by the user to confirm). */
  @IsString()
  @MaxLength(32)
  confirmCode!: string;
}
