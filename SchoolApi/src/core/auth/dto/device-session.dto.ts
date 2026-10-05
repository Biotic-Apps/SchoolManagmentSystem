import type { ClientPlatform } from '../../../generated/prisma/client';

export class DeviceSessionDto {
  id!: string;
  deviceName!: string | null;
  platform!: ClientPlatform;
  ip!: string | null;
  createdAt!: string;
  lastUsedAt!: string;
  current!: boolean;
}
