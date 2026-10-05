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
  className!: string;
  sectionName!: string;
  branchName!: string;
}

export class MeDto {
  user!: MeUserDto;
  activeRole!: string;
  roles!: string[];
  permissions!: string[];
  assignments!: AssignmentDto[];
  /** PARENT only; empty until Phase 2. */
  children!: MeChildDto[];
}
