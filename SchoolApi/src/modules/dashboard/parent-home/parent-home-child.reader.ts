import { Injectable } from '@nestjs/common';
import { notFound } from '../../../core/common/errors/errors';
import { UrlSigner } from '../../../core/files/url-signer';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { fullName } from '../../students/student.mapper';
import type { ParentHomeChildDto } from './parent-home.dto';

/** Header card of the parent home: who the child is and where they sit. */
@Injectable()
export class ParentHomeChildReader {
  constructor(
    private readonly prisma: PrismaService,
    private readonly signer: UrlSigner,
  ) {}

  async read(studentId: string): Promise<ParentHomeChildDto> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNo: true,
        photoFileId: true,
        enrollments: {
          where: { status: 'ACTIVE' },
          take: 1,
          select: {
            rollNo: true,
            branch: { select: { name: true, phone: true } },
            section: {
              select: {
                name: true,
                schoolClass: { select: { name: true } },
                classTeacher: { select: { name: true, userId: true } },
              },
            },
          },
        },
      },
    });
    if (!student) throw notFound('Student');
    const current = student.enrollments[0];
    const teacher = current?.section.classTeacher ?? null;
    return {
      id: student.id,
      name: fullName(student),
      photoUrl: student.photoFileId
        ? this.signer.sign(student.photoFileId).url
        : null,
      admissionNo: student.admissionNo,
      className: current?.section.schoolClass.name ?? null,
      sectionName: current?.section.name ?? null,
      rollNo: current?.rollNo ?? null,
      branchName: current?.branch.name ?? null,
      branchPhone: current?.branch.phone ?? null,
      classTeacher: teacher
        ? { name: teacher.name, userId: teacher.userId }
        : null,
    };
  }
}
