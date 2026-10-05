import type { AcademicSessionStatus } from '../../../generated/prisma/client';

export class AcademicSessionDto {
  id!: string;
  branchId!: string;
  name!: string;
  startDate!: string;
  endDate!: string;
  status!: AcademicSessionStatus;
  termCount!: number;
}
