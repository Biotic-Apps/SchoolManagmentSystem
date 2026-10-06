import { AssignmentDto } from '../../users/dto/assignment.dto';

export class MeUserDto {
  id!: string;
  name!: string;
  email!: string | null;
  phone!: string | null;
  mustChangePassword!: boolean;
}

export class MeChildDto {
  id!: string;
  name!: string;
  admissionNo!: string;
  photoUrl!: string | null;
  className!: string;
  sectionName!: string;
  branchName!: string;
  sessionName!: string;
}

export class MeTwoFactorDto {
  enabled!: boolean;
  /** A held role is in the school's twoFactorRequiredFor. */
  required!: boolean;
}

/** `user` plus the 2FA flags (web reads them from here). */
export class MeSessionUserDto extends MeUserDto {
  twoFactorEnabled!: boolean;
  twoFactorRequired!: boolean;
}

export class MeDto {
  user!: MeSessionUserDto;
  twoFactor!: MeTwoFactorDto;
  /** Strictest idle timeout of the user's schools (web idle logout). */
  sessionTimeoutMinutes!: number;
  activeRole!: string;
  roles!: string[];
  permissions!: string[];
  assignments!: AssignmentDto[];
  /** Verified children when the user holds PARENT. */
  children!: MeChildDto[];
}
