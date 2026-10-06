import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RoleKey } from '../../../core/rbac/role-key.enum';
import { SchoolPeopleService } from '../../school-day/school-people.service';
import { StockLedger } from '../stock/stock-ledger';

export const LOW_STOCK_JOB = 'inventory.lowStock';
const LISTED = 5;

/** Daily: tells accountants and the principal which items need reordering. */
@Injectable()
export class LowStockProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = LOW_STOCK_JOB;
  private readonly logger = new Logger(LowStockProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly stock: StockLedger,
    private readonly people: SchoolPeopleService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '0 7 * * *',
    });
  }

  async process(): Promise<void> {
    const branches = await this.prisma.branch.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, schoolId: true, name: true },
    });
    for (const branch of branches) {
      try {
        await this.check(branch);
      } catch (error) {
        this.logger.warn(
          `Low stock check of ${branch.id} failed: ${String(error)}`,
        );
      }
    }
  }

  private async check(branch: { id: string; schoolId: string; name: string }) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        schoolId: branch.schoolId,
        status: 'ACTIVE',
        reorderLevel: { gt: 0 },
      },
      select: { id: true, name: true, reorderLevel: true },
      orderBy: { name: 'asc' },
    });
    if (items.length === 0) return;
    const stock = await this.stock.quantities(branch.id);
    const low = items.filter((i) => (stock.get(i.id) ?? 0) <= i.reorderLevel);
    if (low.length === 0) return;
    const principal = await this.people.principalOf(branch.id);
    const accountants = await this.people.roleHolders(
      branch.id,
      RoleKey.ACCOUNTANT,
    );
    const listed = low
      .slice(0, LISTED)
      .map((i) => `${i.name} (${stock.get(i.id) ?? 0})`)
      .join(', ');
    const more = low.length > LISTED ? ` and ${low.length - LISTED} more` : '';
    await this.notifications.notify({
      userIds: [...accountants, ...(principal ? [principal] : [])],
      category: 'INVENTORY',
      title: `Low stock at ${branch.name}: ${low.length} item(s)`,
      body: `Reorder: ${listed}${more}.`,
      data: { branchId: branch.id, itemIds: low.map((i) => i.id) },
    });
  }
}
