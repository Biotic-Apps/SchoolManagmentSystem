import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/common/decorators/public.decorator';
import { invalid, notFound } from '../../core/common/errors/errors';
import { toJson } from '../../core/common/prisma-json';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  formatNumber,
  SequenceService,
} from '../../core/sequences/sequence.service';
import { assertOnePrimary } from '../students/registration/guardian-writer';
import { fullName } from '../students/student.mapper';
import { APPLICATION_INCLUDE } from './applications.repository';
import {
  PublicApplicationInputDto,
  PublicApplicationResultDto,
  PublicApplicationStatusDto,
  PublicFormConfigDto,
  type PublicBranchDto,
  type PublicClassDto,
  type PublicSchoolInfoDto,
  type PublicSessionDto,
} from './dto/public-admission.dto';

@ApiTags('public-admissions')
@Public()
@Controller('public/admissions')
export class PublicAdmissionsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sequences: SequenceService,
  ) {}

  @Get('schools/:schoolCode/form-config')
  async formConfig(
    @Param('schoolCode') schoolCode: string,
  ): Promise<PublicFormConfigDto> {
    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
      },
    });
    if (!school) throw notFound('School');

    const [branches, classes, sessions] = await Promise.all([
      this.prisma.branch.findMany({
        where: { schoolId: school.id, status: 'ACTIVE' },
        select: { id: true, code: true, name: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.schoolClass.findMany({
        where: { schoolId: school.id, status: 'ACTIVE' },
        select: { id: true, name: true, levelOrder: true },
        orderBy: { levelOrder: 'asc' },
      }),
      this.prisma.academicSession.findMany({
        where: { schoolId: school.id, status: 'ACTIVE' },
        select: { id: true, name: true, branchId: true },
        orderBy: { name: 'desc' },
      }),
    ]);

    const schoolInfo: PublicSchoolInfoDto = {
      name: school.name,
      code: school.code,
      address: school.address,
      phone: school.phone,
      email: school.email,
      logoUrl: null,
    };

    return {
      school: schoolInfo,
      branches: branches as PublicBranchDto[],
      classes: classes as PublicClassDto[],
      sessions: sessions as PublicSessionDto[],
    };
  }

  @Post('schools/:schoolCode/apply')
  async apply(
    @Param('schoolCode') schoolCode: string,
    @Body() dto: PublicApplicationInputDto,
  ): Promise<PublicApplicationResultDto> {
    assertOnePrimary(dto.guardians);

    const school = await this.prisma.school.findUnique({
      where: { code: schoolCode, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!school) throw notFound('School');

    const session = await this.prisma.academicSession.findUnique({
      where: { id: dto.sessionId },
      select: { id: true, schoolId: true, branchId: true },
    });
    if (!session || session.schoolId !== school.id)
      throw invalid('Invalid session for this school');
    if (session.branchId !== dto.branchId)
      throw invalid('Session does not belong to the selected branch');

    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
      select: { id: true, schoolId: true, name: true },
    });
    if (!schoolClass || schoolClass.schoolId !== school.id)
      throw invalid('Invalid class for this school');

    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
      select: { id: true, schoolId: true },
    });
    if (!branch || branch.schoolId !== school.id)
      throw invalid('Invalid branch for this school');

    const childFullName = fullName(dto.child);
    const year = new Date().getUTCFullYear();

    const row = await this.prisma.$transaction(async (tx) => {
      const seq = await this.sequences.next(
        tx,
        `application:${dto.branchId}:${year}`,
      );
      return tx.admissionApplication.create({
        data: {
          schoolId: school.id,
          branchId: dto.branchId,
          sessionId: dto.sessionId,
          classId: dto.classId,
          applicationNo: formatNumber('APP', year, seq),
          childName: childFullName,
          child: toJson(dto.child),
          guardians: toJson(dto.guardians),
          notes: dto.notes,
        },
        include: APPLICATION_INCLUDE,
      });
    });

    return {
      applicationNo: row.applicationNo,
      childName: row.childName,
      className: row.schoolClass.name,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }

  @Get('status/:applicationNo')
  async status(
    @Param('applicationNo') applicationNo: string,
  ): Promise<PublicApplicationStatusDto> {
    const row = await this.prisma.admissionApplication.findFirst({
      where: { applicationNo },
      include: { schoolClass: { select: { name: true } } },
    });
    if (!row) throw notFound('Application');

    return {
      applicationNo: row.applicationNo,
      childName: row.childName,
      className: row.schoolClass.name,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
