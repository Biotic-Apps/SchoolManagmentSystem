import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { toSkipTake } from '../common/pagination/paginate';
import type { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Log a sent or failed WhatsApp message for the audit trail. */
  log(data: {
    schoolId: string;
    to: string;
    templateName: string;
    status: 'SENT' | 'FAILED';
    error?: string;
  }) {
    return this.prisma.whatsappMessage.create({
      data: {
        schoolId: data.schoolId,
        to: data.to,
        templateName: data.templateName,
        status: data.status,
        error: data.error?.slice(0, 500),
        sentAt: data.status === 'SENT' ? new Date() : undefined,
      },
    });
  }

  /** Paginated message log for a school. */
  async list(
    schoolIds: string[],
    filters: { status?: string },
    page: PaginationQueryDto,
  ) {
    const where: Prisma.WhatsappMessageWhereInput = {
      schoolId: { in: schoolIds },
      ...(filters.status && { status: filters.status }),
    };
    const [rows, total] = await Promise.all([
      this.prisma.whatsappMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...toSkipTake(page),
      }),
      this.prisma.whatsappMessage.count({ where }),
    ]);
    return { rows, total };
  }
}
