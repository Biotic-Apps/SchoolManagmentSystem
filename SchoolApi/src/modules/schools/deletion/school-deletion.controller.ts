import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { DeleteSchoolDto } from './dto/delete-school.dto';
import {
  SchoolDeletionPreviewDto,
  SchoolDeletionStatusDto,
} from './dto/school-deletion.dto';
import { SchoolDeletionService } from './school-deletion.service';

/** Permanent school deletion: super admin only (403 for everyone else). */
@ApiTags('schools')
@ApiBearerAuth()
@RequirePermission('schools.delete')
@Controller('schools')
export class SchoolDeletionController {
  constructor(private readonly deletion: SchoolDeletionService) {}

  @Get(':id/deletion-preview')
  @ApiData(SchoolDeletionPreviewDto)
  preview(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolDeletionPreviewDto> {
    return this.deletion.preview(user, id);
  }

  @Get(':id/deletion-status')
  @ApiData(SchoolDeletionStatusDto)
  status(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolDeletionStatusDto> {
    return this.deletion.status(user, id);
  }

  /** Queues the deletion (202); follow it with GET :id/deletion-status. */
  @Delete(':id')
  @HttpCode(202)
  @ApiData(SchoolDeletionStatusDto)
  @ApiResponse({ status: 400, description: 'CONFIRM_CODE_MISMATCH' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DeleteSchoolDto,
  ): Promise<SchoolDeletionStatusDto> {
    return this.deletion.request(user, id, body.confirmCode);
  }
}
