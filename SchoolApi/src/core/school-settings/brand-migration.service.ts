import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandMigrationService implements OnApplicationBootstrap {
  private readonly log = new Logger(BrandMigrationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    const result = await this.prisma.$executeRaw`
      UPDATE school_settings
      SET primary_color = '#7B68EE', accent_soft_color = '#EDE9FE'
      WHERE UPPER(primary_color) = '#0B7F74'
    `;
    if (result > 0) {
      this.log.log(`Migrated ${result} school(s) from teal to purple brand`);
    }
  }
}
