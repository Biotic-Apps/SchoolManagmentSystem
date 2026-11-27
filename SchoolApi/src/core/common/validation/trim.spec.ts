import { plainToInstance } from 'class-transformer';
import { IsString, MinLength, validateSync } from 'class-validator';
import { Trim } from './trim';

class Sample {
  @Trim()
  @IsString()
  @MinLength(1)
  title!: string;
}

describe('Trim', () => {
  it('rejects a whitespace-only value and trims a real one', () => {
    const blank = plainToInstance(Sample, { title: '   ' });
    expect(validateSync(blank)).toHaveLength(1);
    const real = plainToInstance(Sample, { title: '  Sports day ' });
    expect(validateSync(real)).toHaveLength(0);
    expect(real.title).toBe('Sports day');
  });
});
