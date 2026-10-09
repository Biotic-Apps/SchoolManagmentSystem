import type {
  GuardianLinkStatus,
  GuardianRelation,
  UserStatus,
} from '../../../generated/prisma/client';
import { ParentLoginDto } from '../../students/dto/parent-login.dto';
import { GuardianDto, GuardianLinkDto } from '../../students/dto/student.dto';

export class GuardianChildDto {
  linkId!: string;
  studentId!: string;
  /** Also the parent's sign-in username. */
  admissionNo!: string;
  name!: string;
  className!: string | null;
  sectionName!: string | null;
  relation!: GuardianRelation;
  status!: GuardianLinkStatus;
}

/** The parent login (User) behind a guardian; its ids may differ from the record's. */
export class GuardianLoginDto {
  email!: string | null;
  phone!: string | null;
  status!: UserStatus;
  /** Still on a temporary password. */
  mustChangePassword!: boolean;
  lastLoginAt!: string | null;
}

export class GuardianDetailDto extends GuardianDto {
  /** Null when the guardian has no parent login. */
  login!: GuardianLoginDto | null;
  children!: GuardianChildDto[];
}

export class GuardianAccountDto {
  userId!: string;
  /** Sign-in ids (any linked child's admission number also works). */
  email!: string | null;
  phone!: string | null;
  /** Only when a new login was created; shown once. */
  temporaryPassword!: string | null;
}

export class GuardianPasswordResetDto {
  userId!: string;
  temporaryPassword!: string;
}

export class GuardianSignInSentDto {
  /** Where the instructions went (email, SMS or both). */
  channels!: ('EMAIL' | 'SMS')[];
}

export class AddedGuardianLinkDto extends GuardianLinkDto {
  /** The guardian's parent sign-in; a temporary password only when just created. */
  parentLogin!: ParentLoginDto | null;
}
