import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../core/common/swagger/api-data.decorator';
import { RequirePermission } from '../../core/rbac/require-permission.decorator';
import { DEFAULT_BELL } from '../timetable/periods/bell-generator';
import { SetupPresetsDto } from './dto/setup-presets.dto';
import { LEVEL_PRESETS } from './level-presets';

@ApiTags('school-setup')
@ApiBearerAuth()
@Controller('setup')
export class PresetsController {
  @Get('presets')
  @RequirePermission('schools.add')
  @ApiOperation({
    summary:
      'Wizard starting points: classes and subjects per level, bell defaults',
  })
  @ApiData(SetupPresetsDto)
  presets(): SetupPresetsDto {
    return {
      levels: LEVEL_PRESETS.map((l) => ({
        key: l.key,
        label: l.label,
        classNames: l.classNames,
        sections: l.sections.map((s) => ({
          name: s.name,
          group: s.group ?? null,
        })),
        subjects: l.subjects.map((s) => ({
          code: s.code,
          name: s.name,
          periodsPerWeek: s.periodsPerWeek,
          group: s.group ?? null,
          isOptional: s.isOptional ?? false,
        })),
      })),
      bellSchedule: { ...DEFAULT_BELL, friday: { ...DEFAULT_BELL.friday } },
    };
  }
}
