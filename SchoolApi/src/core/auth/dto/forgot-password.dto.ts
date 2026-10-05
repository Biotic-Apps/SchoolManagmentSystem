import { IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;
}
