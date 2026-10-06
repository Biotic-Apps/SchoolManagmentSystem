import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EnquiryStatus, Gender } from '../../../generated/prisma/client';
import { ListQueryDto } from '../../../core/common/pagination/list-query.dto';
import { IsOptionalDateOnly } from '../../../core/common/validation/is-date-only';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';

export class EnquiryDto {
  id!: string;
  branchId!: string;
  sessionId!: string;
  classId!: string;
  className!: string;
  childName!: string;
  dob!: string | null;
  guardianName!: string;
  phone!: string;
  email!: string | null;
  source!: string | null;
  notes!: string | null;
  followUpDate!: string | null;
  status!: EnquiryStatus;
  applicationId!: string | null;
  createdAt!: string;
}

export class CreateEnquiryDto {
  @IsUUID()
  branchId!: string;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  classId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  childName!: string;

  @IsOptionalDateOnly()
  dob?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  guardianName!: string;

  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptionalDateOnly()
  followUpDate?: string;
}

export class UpdateEnquiryDto {
  @IsOptional()
  @IsIn([EnquiryStatus.NEW, EnquiryStatus.CONTACTED, EnquiryStatus.CLOSED])
  status?: EnquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptionalDateOnly()
  followUpDate?: string;
}

/** Fills what the enquiry did not capture. */
export class ConvertEnquiryDto {
  @IsIn(Object.values(Gender))
  gender!: Gender;

  @IsOptionalDateOnly()
  dob?: string;
}

export class EnquiryQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
