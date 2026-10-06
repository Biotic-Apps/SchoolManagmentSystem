import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RecordStatus } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';

export class CreateVendorDto {
  @ApiPropertyOptional({ description: 'Defaults to the caller’s school' })
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  ntn?: string;
}

export class VendorQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  schoolId?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class VendorDto {
  id!: string;
  schoolId!: string;
  name!: string;
  contactPerson!: string | null;
  phone!: string | null;
  email!: string | null;
  address!: string | null;
  ntn!: string | null;
  @ApiProperty({ enum: RecordStatus })
  status!: RecordStatus;
  createdAt!: string;
}
