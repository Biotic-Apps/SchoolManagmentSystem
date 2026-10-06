import type {
  GuardianLinkStatus,
  GuardianRelation,
} from '../../../generated/prisma/client';
import { GuardianDto } from '../../students/dto/student.dto';

export class GuardianChildDto {
  linkId!: string;
  studentId!: string;
  name!: string;
  className!: string | null;
  sectionName!: string | null;
  relation!: GuardianRelation;
  status!: GuardianLinkStatus;
}

export class GuardianDetailDto extends GuardianDto {
  children!: GuardianChildDto[];
}

export class GuardianAccountDto {
  userId!: string;
  /** Only when a new login was created; shown once. */
  temporaryPassword!: string | null;
}
