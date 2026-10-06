import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BRANCH_SETTING_DEFAULTS } from './branch-settings.defaults';

export interface OfficeHours {
  from: string;
  to: string;
}

/** Internal read of one setting with its default (no scope check). */
@Injectable()
export class BranchSettingsReader {
  constructor(private readonly prisma: PrismaService) {}

  async get<T>(branchId: string, key: string): Promise<T> {
    const row = await this.prisma.branchSetting.findUnique({
      where: { branchId_key: { branchId, key } },
    });
    return (row?.value ?? BRANCH_SETTING_DEFAULTS[key]) as T;
  }
}
