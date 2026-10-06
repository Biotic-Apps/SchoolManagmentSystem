import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { Public } from '../../core/common/decorators/public.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { FileContentQueryDto } from '../../core/files/dto/file-content-query.dto';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { BackupsQuery } from './backups.query';
import { BackupsService } from './backups.service';
import {
  BackupDownloadDto,
  BackupJobDto,
  BackupRunDto,
} from './dto/backup-run.dto';

/** Phase 5 §D: Super Admin only (active role + settings.edit). */
@ApiTags('backups')
@ApiBearerAuth()
@Controller('backups')
export class BackupsController {
  constructor(
    private readonly backups: BackupsService,
    private readonly query: BackupsQuery,
  ) {}

  @Get()
  @RequirePermission('settings.edit')
  @ApiData(BackupRunDto, { isArray: true })
  list(@CurrentUser() user: AuthUser): Promise<BackupRunDto[]> {
    this.backups.assertSuperAdmin(user);
    return this.query.list();
  }

  @Post()
  @RequirePermission('settings.edit')
  @ApiData(BackupJobDto)
  create(@CurrentUser() user: AuthUser): Promise<BackupJobDto> {
    return this.backups.requestBackup(user);
  }

  @Post(':id/verify')
  @HttpCode(200)
  @RequirePermission('settings.edit')
  @ApiData(BackupJobDto)
  verify(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BackupJobDto> {
    return this.backups.requestVerify(user, id);
  }

  @Get(':id/download')
  @RequirePermission('settings.edit')
  @ApiData(BackupDownloadDto)
  download(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BackupDownloadDto> {
    return this.backups.downloadUrl(user, id);
  }

  /** Target of signed download links (local storage); the signature authorizes. */
  @Public()
  @SkipThrottle()
  @Get(':id/content')
  async content(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: FileContentQueryDto,
  ): Promise<StreamableFile> {
    const file = await this.backups.open(id, query.exp, query.sig);
    return new StreamableFile(file.stream, {
      type: 'application/octet-stream',
      length: file.size ?? undefined,
      disposition: `attachment; filename="${file.name}"`,
    });
  }
}
