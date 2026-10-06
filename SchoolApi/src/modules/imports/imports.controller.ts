import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  CommitImportDto,
  CREATE_IMPORT_SCHEMA,
  CreateImportDto,
  ImportCreatedDto,
  ImportDetailDto,
  ImportKindParamDto,
  ImportQueryDto,
  ImportSummaryDto,
} from './dto/import.dto';
import { ImportCommitService } from './import-commit.service';
import { ImportRevertService } from './import-revert.service';
import { ImportsService } from './imports.service';
import {
  IMPORT_MIME,
  MAX_IMPORT_BYTES,
  type ImportUpload,
} from './parsing/read-file';

/** Phase 5 §E: onboarding data import (settings.edit or settings.import). */
@ApiTags('imports')
@ApiBearerAuth()
@RequirePermission('settings.edit', 'settings.import')
@Controller('imports')
export class ImportsController {
  constructor(
    private readonly imports: ImportsService,
    private readonly commits: ImportCommitService,
    private readonly reverts: ImportRevertService,
  ) {}

  @Get('templates/:kind')
  async template(@Param() params: ImportKindParamDto): Promise<StreamableFile> {
    const buffer = await this.imports.template(params.kind);
    return new StreamableFile(buffer, {
      type: IMPORT_MIME.xlsx,
      length: buffer.length,
      disposition: `attachment; filename="${params.kind.toLowerCase()}-template.xlsx"`,
    });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMPORT_BYTES, files: 1 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: CREATE_IMPORT_SCHEMA })
  @ApiData(ImportCreatedDto)
  create(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @UploadedFile() file: ImportUpload | undefined,
    @Body() body: CreateImportDto,
  ): Promise<ImportCreatedDto> {
    return this.imports.create(user, scope, file, body);
  }

  @Get()
  @ApiData(ImportSummaryDto, { isArray: true })
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ImportQueryDto,
  ): Promise<ImportSummaryDto[]> {
    return this.imports.list(scope, query.branchId);
  }

  @Get(':id')
  @ApiData(ImportDetailDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ImportDetailDto> {
    return this.imports.get(scope, id);
  }

  @Post(':id/commit')
  @HttpCode(200)
  @ApiData(ImportDetailDto)
  commit(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CommitImportDto,
  ): Promise<ImportDetailDto> {
    return this.commits.commit(user, scope, id, body.skipInvalid ?? false);
  }

  @Post(':id/revert')
  @HttpCode(200)
  @ApiData(ImportDetailDto)
  revert(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ImportDetailDto> {
    return this.reverts.revert(user, scope, id);
  }
}
