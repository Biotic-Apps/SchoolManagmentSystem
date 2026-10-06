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

export class MeDto {
  user!: MeUserDto;
  activeRole!: string;
  roles!: string[];
  permissions!: string[];
  assignments!: AssignmentDto[];
  /** Verified children when the user holds PARENT. */
  children!: MeChildDto[];
}
