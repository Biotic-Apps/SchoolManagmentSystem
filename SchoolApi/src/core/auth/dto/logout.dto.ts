import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  refreshToken?: string;
}
