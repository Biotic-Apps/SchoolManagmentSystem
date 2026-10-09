import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @MinLength(10)
  @MaxLength(4096)
  token!: string;

  @IsIn(['WEB', 'ANDROID'])
  platform!: 'WEB' | 'ANDROID';
}

export class UnregisterDeviceDto {
  @IsString()
  @MinLength(10)
  @MaxLength(4096)
  token!: string;
}
