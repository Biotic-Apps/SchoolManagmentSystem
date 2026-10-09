import { amountInWords, wholeInWords } from './amount-in-words';

describe('amountInWords', () => {
  it('uses lakh and crore grouping', () => {
    expect(wholeInWords(0n)).toBe('Zero');
    expect(wholeInWords(15n)).toBe('Fifteen');
    expect(wholeInWords(105n)).toBe('One Hundred Five');
    expect(wholeInWords(12_500n)).toBe('Twelve Thousand Five Hundred');
    expect(wholeInWords(1_50_000n)).toBe('One Lakh Fifty Thousand');
    expect(wholeInWords(2_03_45_678n)).toBe(
      'Two Crore Three Lakh Forty-Five Thousand Six Hundred Seventy-Eight',
    );
  });

  it('prints rupees, paisa and "Only"', () => {
    expect(amountInWords(1_250_000n)).toBe(
      'Rupees Twelve Thousand Five Hundred Only',
    );
    expect(amountInWords(1_250_050n)).toBe(
      'Rupees Twelve Thousand Five Hundred and Fifty Paisa Only',
    );
    expect(amountInWords(0n)).toBe('Rupees Zero Only');
  });

  it('names other currencies by code', () => {
    expect(amountInWords(10_000n, 'USD')).toBe('USD One Hundred Only');
  });
});
