import { Injectable } from '@nestjs/common';
import { forbiddenScope, notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { Scope } from '../../core/rbac/scope/scope';
import { CERTIFICATE_INCLUDE, type CertificateRow } from './certificate.mapper';

/** Loads one certificate with the scope check (parents: 404 outside own children). */
@Injectable()
export class CertificateAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async read(scope: Scope, id: string): Promise<CertificateRow> {
    const row = await this.find(id);
    if (scope.guardian) {
      if (!scope.canAccessStudent(row.studentId)) throw notFound('Certificate');
      return row;
    }
    if (!scope.canReadBranch({ id: row.branchId, schoolId: row.schoolId })) {
      throw forbiddenScope();
    }
    return row;
  }

  /** Office/principal actions need management scope over the branch. */
  async manage(scope: Scope, id: string): Promise<CertificateRow> {
    const row = await this.find(id);
    if (scope.guardian) throw notFound('Certificate');
    scope.assertManageBranch({ id: row.branchId, schoolId: row.schoolId });
    return row;
  }

  async find(id: string): Promise<CertificateRow> {
    const row = await this.prisma.certificate.findUnique({
      where: { id },
      include: CERTIFICATE_INCLUDE,
    });
    if (!row) throw notFound('Certificate');
    return row;
  }
}
