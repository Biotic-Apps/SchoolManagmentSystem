import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/common/decorators/public.decorator';
import { formatDate } from '../../core/common/dates';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AuthThrottle } from '../../core/throttling/auth-throttle.decorator';
import { fullName } from '../students/student.mapper';
import { CertificateVerificationDto } from './dto/certificate.dto';

const UNKNOWN: CertificateVerificationDto = {
  valid: false,
  type: null,
  studentName: null,
  issuedOn: null,
};

/** QR target: confirms an issued original by serial, nothing else. */
@ApiTags('certificates')
@Controller('certificates/verify')
export class CertificateVerifyController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @AuthThrottle()
  @Get(':serial')
  @ApiData(CertificateVerificationDto)
  async verify(
    @Param('serial') serial: string,
  ): Promise<CertificateVerificationDto> {
    if (serial.length > 64) return UNKNOWN;
    const row = await this.prisma.certificate.findFirst({
      where: { serialNo: serial, duplicateOfId: null, status: 'ISSUED' },
      select: {
        type: true,
        issuedOn: true,
        student: { select: { firstName: true, lastName: true } },
      },
    });
    if (!row || !row.issuedOn) return UNKNOWN;
    return {
      valid: true,
      type: row.type,
      studentName: fullName(row.student),
      issuedOn: formatDate(row.issuedOn),
    };
  }
}
