import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PHONE_PATTERN } from '../../me/dto/update-me.dto';
import { STAFF_ROLE_KEYS } from '../dto/staff-input.dto';

export class CreateStaffAccountDto {
  /** Defaults to the staff record's email. */
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  /** Defaults to the staff record's phone. */
  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'phone must be a valid phone number' })
  phone?: string;

  /** Defaults from the designation. */
  @IsOptional()
  @IsIn(STAFF_ROLE_KEYS)
  roleKey?: (typeof STAFF_ROLE_KEYS)[number];

  /** Set by the admin; otherwise a temporary password is generated. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;
}

export class StaffAccountDto {
  userId!: string;
  email!: string | null;
  phone!: string | null;
  /** Only when generated; shown once. */
  temporaryPassword?: string;
}

export class StaffPasswordResetDto {
  userId!: string;
  temporaryPassword!: string;
}
