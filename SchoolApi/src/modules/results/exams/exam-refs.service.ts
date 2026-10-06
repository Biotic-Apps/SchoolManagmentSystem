import { Injectable } from '@nestjs/common';
import { invalid } from '../../../core/common/errors/errors';
import { PrismaService } from '../../../core/prisma/prisma.service';

/** Validates the term, grading scheme and classes an exam refers to (400). */
@Injectable()
export class ExamRefsService {
  constructor(private readonly prisma: PrismaService) {}

  async term(termId: string | undefined, sessionId: string) {
    if (!termId) return;
    const term = await this.prisma.term.findUnique({ where: { id: termId } });
    if (!term || term.sessionId !== sessionId)
      throw invalid('Term not found in this session');
  }

  async scheme(schemeId: string, sessionId: string) {
    const scheme = await this.prisma.gradingScheme.findUnique({
      where: { id: schemeId },
    });
    if (!scheme || scheme.sessionId !== sessionId)
      throw invalid('Grading scheme not found in this session');
  }

  async classes(ids: string[], schoolId: string) {
    const unique = [...new Set(ids)];
    const found = await this.prisma.schoolClass.findMany({
      where: { id: { in: unique }, schoolId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (found.length !== unique.length) {
      const known = new Set(found.map((c) => c.id));
      throw invalid('Classes not found in this school', {
        classIds: unique.filter((id) => !known.has(id)),
      });
    }
    return unique;
  }
}
