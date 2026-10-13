import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandMigrationService implements OnApplicationBootstrap {
  private readonly log = new Logger(BrandMigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const { count } = await this.prisma.schoolSetting.updateMany({
      where: { primaryColor: '#0B7F74' },
      data: { primaryColor: '#7B68EE', accentSoftColor: '#EDE9FE' },
    });
    if (count > 0) {
      this.log.log(`Migrated ${count} school(s) from teal to purple brand`);
    }
  }
}
