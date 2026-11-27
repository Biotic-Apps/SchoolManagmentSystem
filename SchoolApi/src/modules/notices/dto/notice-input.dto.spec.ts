import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateActivityDto } from '../../activities/dto/activity-input.dto';
import { CreateNoticeDto } from './notice-input.dto';

const failed = (errors: ReturnType<typeof validateSync>) =>
  errors.map((e) => e.property);

describe('whitespace-only titles', () => {
  it('rejects a notice with a blank title or body', () => {
    const dto = plainToInstance(CreateNoticeDto, {
      title: '   ',
      body: '  ',
      audience: { schoolWide: true },
    });
    expect(failed(validateSync(dto))).toEqual(['title', 'body']);
  });

  it('rejects an activity with a blank title', () => {
    const dto = plainToInstance(CreateActivityDto, {
      branchId: '0193a000-0000-7000-8000-000000000001',
      type: 'EVENT',
      title: '   ',
      description: 'x',
      startAt: '2026-12-17T09:00:00+05:00',
      endAt: '2026-12-17T12:00:00+05:00',
      audience: { wholeBranch: true },
      consentRequired: false,
    });
    expect(failed(validateSync(dto))).toContain('title');
  });
});
