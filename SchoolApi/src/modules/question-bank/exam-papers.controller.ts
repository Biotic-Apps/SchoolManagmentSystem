import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { PageResult } from '../../core/common/pagination/page-result';
import { ApiData, ApiPage } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { CurrentScope } from '../../core/rbac/scope/current-scope.decorator';
import type { Scope } from '../../core/rbac/scope/scope';
import {
  ExamPaperDto,
  ExamPaperQueryDto,
  GenerateExamPaperDto,
  UpdateExamPaperDto,
} from './dto/exam-paper.dto';
import { ExamPapersService } from './exam-papers.service';
import { ExamPaperPdfService } from './exam-paper-pdf.service';

@ApiTags('exam-papers')
@ApiBearerAuth()
@Controller('exam-papers')
export class ExamPapersController {
  constructor(
    private readonly examPapers: ExamPapersService,
    private readonly pdf: ExamPaperPdfService,
  ) {}

  @Get()
  @RequirePermission('exam-papers.view')
  @ApiPage(ExamPaperDto)
  list(
    @CurrentScope() scope: Scope,
    @Query() query: ExamPaperQueryDto,
  ): Promise<PageResult<ExamPaperDto>> {
    return this.examPapers.list(scope, query);
  }

  @Post('generate')
  @RequirePermission('exam-papers.add')
  @ApiData(ExamPaperDto)
  generate(
    @CurrentUser() user: AuthUser,
    @CurrentScope() scope: Scope,
    @Body() body: GenerateExamPaperDto,
  ): Promise<ExamPaperDto> {
    return this.examPapers.generate(user, scope, body);
  }

  @Get(':id')
  @RequirePermission('exam-papers.view')
  @ApiData(ExamPaperDto)
  get(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExamPaperDto> {
    return this.examPapers.get(scope, id);
  }

  @Patch(':id')
  @RequirePermission('exam-papers.add')
  @ApiData(ExamPaperDto)
  update(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateExamPaperDto,
  ): Promise<ExamPaperDto> {
    return this.examPapers.update(scope, id, body);
  }

  @Get(':id/pdf')
  @RequirePermission('exam-papers.view')
  async downloadPdf(
    @CurrentScope() scope: Scope,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.pdf.generate(scope, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="exam-paper-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
