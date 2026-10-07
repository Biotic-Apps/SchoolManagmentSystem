import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import type { AuthUser } from '../../core/common/types/auth-user';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { SchoolSetupDto } from './dto/school-setup.dto';
import { SchoolSetupResultDto } from './dto/school-setup-result.dto';
import { SchoolSetupService } from './school-setup.service';

@ApiTags('school-setup')
@ApiBearerAuth()
@Controller('schools')
export class SchoolSetupController {
  constructor(private readonly setup: SchoolSetupService) {}

  @Post('setup')
  @RequirePermission('schools.add')
  @ApiOperation({
    summary:
      'One-form school provisioning (Super Admin): school, main branch, principal, active session, classes, sections, subjects in one transaction',
  })
  @ApiExtraModels(SchoolSetupResultDto)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: { data: { $ref: getSchemaPath(SchoolSetupResultDto) } },
    },
  })
  @ApiBadRequestResponse({
    description:
      'VALIDATION_FAILED; each message in details starts with the field path, e.g. "school.code …"',
  })
  @ApiForbiddenResponse({ description: 'Caller is not Super Admin' })
  @ApiConflictResponse({
    description: 'SCHOOL_CODE_TAKEN | USER_EMAIL_TAKEN | USER_PHONE_TAKEN',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: SchoolSetupDto,
  ): Promise<SchoolSetupResultDto> {
    return this.setup.setup(user, body);
  }
}
