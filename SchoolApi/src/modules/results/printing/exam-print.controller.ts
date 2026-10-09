import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { ApiData } from '../../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { RequirePermission } from '../../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../../core/rbac/scope/scope';
import { JobIdDto } from '../exams/dto/exam.dto';
import { ExamPrintDto } from './dto/print.dto';
import { ExamPrintService } from './exam-print.service';

@ApiTags('exams')
@ApiBearerAuth()
@Controller('exams/:id/print')
export class ExamPrintController {
  constructor(private readonly prints: ExamPrintService) {}

  /** Bulk PDF in the background; poll `GET /jobs/:jobId` for `result.fileUrl`. */
  @Post()
  @HttpCode(200)
  @RequirePermission('exams.view')
  @ApiData(JobIdDto)
  print(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ExamPrintDto,
  ): Promise<JobIdDto> {
    return this.prints.request(user, scope, id, body);
  }
}
