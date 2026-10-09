import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { DiaryQueryDto } from './diary.dto';

const errorsOf = (query: object) =>
  validateSync(plainToInstance(DiaryQueryDto, query), {
    whitelist: true,
    forbidNonWhitelisted: true,
  }).map((e) => e.property);

describe('DiaryQueryDto', () => {
  it('accepts the moderation queue filters', () => {
    expect(
      errorsOf({
        status: 'SUBMITTED',
        branchId: '01a11bac-6930-7338-92de-9f121c5dab92',
      }),
    ).toEqual([]);
  });

  it('rejects an unknown status', () => {
    expect(errorsOf({ status: 'NOPE' })).toEqual(['status']);
  });
});
