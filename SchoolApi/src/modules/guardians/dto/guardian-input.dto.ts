import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GuardianRelation } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';
import { ID_NUMBER_PATTERN } from '../../students/dto/child-input.dto';
import { GuardianInputDto } from '../../students/dto/guardian-input.dto';

export class GuardianQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class UpdateGuardianDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(Object.values(GuardianRelation))
  relation?: GuardianRelation;

  @IsOptional()
  @Matches(ID_NUMBER_PATTERN, { message: 'cnic must be 13 digits' })
  cnic?: string;

  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class AddGuardianLinkDto {
  /** Existing guardian; or give `guardian` to create/find by phone. */
  @IsOptional()
  @IsUUID()
  guardianId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GuardianInputDto)
  guardian?: GuardianInputDto;

  @IsIn(Object.values(GuardianRelation))
  relation!: GuardianRelation;

  @IsBoolean()
  isPrimary!: boolean;
}

export class ReasonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}

export class ContactChangeDto {
  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;
}

export class ContactChangeResultDto {
  approvalId!: string;
  status!: string;
}
