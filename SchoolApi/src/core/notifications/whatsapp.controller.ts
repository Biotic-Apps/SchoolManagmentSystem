import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { toPageResult } from '../common/pagination/paginate';
import type { PageResult } from '../common/pagination/page-result';
import { PrismaService } from '../prisma/prisma.service';
import { RequirePermission } from '../rbac/require-permission.decorator';
import { CurrentScope } from '../rbac/scope/current-scope.decorator';
import type { Scope } from '../rbac/scope/scope';
import { WhatsAppQueryDto } from './dto/whatsapp-query.dto';
import { WhatsAppRepository } from './whatsapp.repository';

@ApiTags('whatsapp')
@ApiBearerAuth()
@Controller('whatsapp/messages')
export class WhatsAppController {
  constructor(
    private readonly repo: WhatsAppRepository,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermission('settings.view')
  async list(
    @CurrentScope() scope: Scope,
    @Query() query: WhatsAppQueryDto,
  ): Promise<PageResult<unknown>> {
    const filter = scope.schoolFilter();
    // Global scope = all schools
    const schoolIds = filter.schoolId?.in ?? (
      await this.prisma.school.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      })
    ).map((s) => s.id);
    const { rows, total } = await this.repo.list(
      schoolIds,
      { status: query.status },
      query,
    );
    return toPageResult(rows, total, query);
  }
}
