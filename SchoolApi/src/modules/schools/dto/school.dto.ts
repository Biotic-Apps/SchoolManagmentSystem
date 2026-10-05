import type { RecordStatus } from '../../../generated/prisma/client';

export class SchoolDto {
  id!: string;
  code!: string;
  name!: string;
  address!: string | null;
  phone!: string | null;
  email!: string | null;
  website!: string | null;
  logoUrl!: string | null;
  status!: RecordStatus;
  branchCount!: number;
  createdAt!: string;
}
