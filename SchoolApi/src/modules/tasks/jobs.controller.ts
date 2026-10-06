import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { notFound } from '../../core/common/errors/errors';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { UrlSigner } from '../../core/files/url-signer';
import { AsyncTaskService } from './async-task.service';
import { JobStatusDto, toJobStatus } from './job-status.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobsController {
  constructor(
    private readonly tasks: AsyncTaskService,
    private readonly signer: UrlSigner,
  ) {}

  /** Status of a job the caller started (others: 404). */
  @Get(':id')
  @ApiData(JobStatusDto)
  async get(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<JobStatusDto> {
    const task = await this.tasks.findOwn(id, user.id);
    if (!task) throw notFound('Job');
    return toJobStatus(task, this.signer);
  }
}
